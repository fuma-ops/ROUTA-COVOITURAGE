/**
 * SEGMENT ENGINE & PRICING ENGINE
 * Conforme à la Spécification Technique Routa Maroc (Pages 4-5 & 7)
 *
 * SEGMENT ENGINE :
 * - Découpe un trajet conducteur en segments consécutifs basés sur les arrêts (pickups & dropoffs)
 * - Identifie précisément les passagers et les seatUnits présents sur chaque segment
 *
 * PRICING ENGINE :
 * - Calcule le prix au kilomètre : pricePerKm = globalPrice / routeDistanceKm
 * - Calcule le coût brut de chaque segment : segmentPrice = segmentDistanceKm * pricePerKm
 * - Répartit équitablement le coût de chaque segment :
 *     passengerSegmentPrice = segmentPrice * passengerSeatUnits / totalSeatUnitsOnSegment
 * - Calcule le total par passager
 * - Vérifie la Règle de Conservation : SUM(passenger prices) ≈ globalPrice (Tolérance <= 0.01 DH)
 */

export interface BookingSegmentUser {
  passengerId: string;
  passengerName?: string;
  seatUnits: number; // 1 pour passager normal, 3 si réservation bloquant 3 places
  pickupPositionKm: number;
  dropoffPositionKm: number;
}

export interface RouteSegment {
  id: string;
  startKm: number;
  endKm: number;
  distanceKm: number;
  segmentPrice: number;
  totalSeatUnitsOnSegment: number;
  users: {
    passengerId: string;
    passengerName?: string;
    seatUnits: number;
    segmentPriceShare: number;
  }[];
}

export interface PassengerPricingResult {
  passengerId: string;
  passengerName?: string;
  seatUnits: number;
  price: number; // e.g. 8.71 DH
  segmentsUsed: {
    segmentId: string;
    startKm: number;
    endKm: number;
    distanceKm: number;
    shareDh: number;
  }[];
}

export interface PricingEngineResponse {
  tripId: string;
  globalPrice: number;
  routeDistanceKm: number;
  pricePerKm: number;
  segments: RouteSegment[];
  passengers: PassengerPricingResult[];
  totalAllocated: number;
  conservationValid: boolean;
  conservationDiff: number;
  status: 'VALID' | 'INVALID';
  errorMessage?: string;
}

/**
 * 1. SEGMENT ENGINE : Découpage géométrique en segments (Sections 17, 18, 19)
 */
export function buildRouteSegments(
  routeDistanceKm: number,
  bookings: BookingSegmentUser[],
  globalPrice: number
): RouteSegment[] {
  // Récupérer toutes les positions distinctes (Section 18)
  const cutPositionsSet = new Set<number>();
  cutPositionsSet.add(0.0);
  cutPositionsSet.add(Math.round(routeDistanceKm * 10) / 10);

  bookings.forEach((b) => {
    cutPositionsSet.add(Math.round(b.pickupPositionKm * 10) / 10);
    cutPositionsSet.add(Math.round(b.dropoffPositionKm * 10) / 10);
  });

  const sortedPositions = Array.from(cutPositionsSet).sort((a, b) => a - b);

  const pricePerKm = routeDistanceKm > 0 ? globalPrice / routeDistanceKm : 0;
  const segments: RouteSegment[] = [];

  for (let i = 0; i < sortedPositions.length - 1; i++) {
    const startKm = sortedPositions[i];
    const endKm = sortedPositions[i + 1];
    const distanceKm = Math.round((endKm - startKm) * 10) / 10;

    if (distanceKm <= 0.001) continue;

    // Déterminer les utilisateurs présents sur ce segment
    // Un utilisateur est présent si pickupPosition <= startKm ET dropoffPosition >= endKm
    const activeUsers = bookings.filter((b) => {
      const p = Math.round(b.pickupPositionKm * 10) / 10;
      const d = Math.round(b.dropoffPositionKm * 10) / 10;
      return p <= startKm && d >= endKm;
    });

    const totalSeatUnitsOnSegment = activeUsers.reduce((sum, u) => sum + u.seatUnits, 0);
    const segmentPrice = Math.round(distanceKm * pricePerKm * 100) / 100;

    const segmentUsers = activeUsers.map((u) => {
      const share =
        totalSeatUnitsOnSegment > 0
          ? Math.round(((segmentPrice * u.seatUnits) / totalSeatUnitsOnSegment) * 100) / 100
          : 0;
      return {
        passengerId: u.passengerId,
        passengerName: u.passengerName,
        seatUnits: u.seatUnits,
        segmentPriceShare: share,
      };
    });

    segments.push({
      id: `S${i + 1}`,
      startKm,
      endKm,
      distanceKm,
      segmentPrice,
      totalSeatUnitsOnSegment,
      users: segmentUsers,
    });
  }

  return segments;
}

/**
 * 2. PRICING ENGINE : Calcul et Répartition stricte avec Conservation (Sections 20 to 28)
 */
export function calculatePricing(
  tripId: string,
  globalPrice: number,
  routeDistanceKm: number,
  bookings: BookingSegmentUser[]
): PricingEngineResponse {
  if (routeDistanceKm <= 0) {
    return {
      tripId,
      globalPrice,
      routeDistanceKm,
      pricePerKm: 0,
      segments: [],
      passengers: [],
      totalAllocated: 0,
      conservationValid: false,
      conservationDiff: globalPrice,
      status: 'INVALID',
      errorMessage: 'Route distance must be greater than zero',
    };
  }

  if (bookings.length === 0) {
    return {
      tripId,
      globalPrice,
      routeDistanceKm,
      pricePerKm: Math.round((globalPrice / routeDistanceKm) * 1000) / 1000,
      segments: [],
      passengers: [],
      totalAllocated: 0,
      conservationValid: true,
      conservationDiff: 0,
      status: 'VALID',
    };
  }

  // 1. Découpage en segments
  const segments = buildRouteSegments(routeDistanceKm, bookings, globalPrice);
  const pricePerKm = Math.round((globalPrice / routeDistanceKm) * 1000) / 1000;

  // 2. Accumulation par passager
  const passengerTotals: Record<
    string,
    {
      passengerName?: string;
      seatUnits: number;
      totalPrice: number;
      segmentsUsed: {
        segmentId: string;
        startKm: number;
        endKm: number;
        distanceKm: number;
        shareDh: number;
      }[];
    }
  > = {};

  bookings.forEach((b) => {
    passengerTotals[b.passengerId] = {
      passengerName: b.passengerName,
      seatUnits: b.seatUnits,
      totalPrice: 0,
      segmentsUsed: [],
    };
  });

  segments.forEach((seg) => {
    seg.users.forEach((u) => {
      if (passengerTotals[u.passengerId]) {
        passengerTotals[u.passengerId].totalPrice += u.segmentPriceShare;
        passengerTotals[u.passengerId].segmentsUsed.push({
          segmentId: seg.id,
          startKm: seg.startKm,
          endKm: seg.endKm,
          distanceKm: seg.distanceKm,
          shareDh: u.segmentPriceShare,
        });
      }
    });
  });

  // Calcul du total alloué (brut)
  let rawTotalAllocated = 0;
  const passengersList: PassengerPricingResult[] = Object.entries(passengerTotals).map(
    ([pid, data]) => {
      const roundedPrice = Math.round(data.totalPrice * 100) / 100;
      rawTotalAllocated += roundedPrice;
      return {
        passengerId: pid,
        passengerName: data.passengerName,
        seatUnits: data.seatUnits,
        price: roundedPrice,
        segmentsUsed: data.segmentsUsed,
      };
    }
  );

  rawTotalAllocated = Math.round(rawTotalAllocated * 100) / 100;

  // Ajustement de conservation à l'arrondi (Section 28: Tolérance <= 0.01 DH)
  // Si tous les segments de la route sont couverts par au moins un passager, la somme doit égaler globalPrice
  const allRouteCovered = segments.every((s) => s.users.length > 0);
  let finalAllocated = rawTotalAllocated;
  let conservationDiff = 0;

  if (allRouteCovered) {
    conservationDiff = Math.abs(Math.round((globalPrice - rawTotalAllocated) * 100) / 100);

    // Ajustement fin d'arrondi sur le passager avec le plus long trajet
    if (conservationDiff > 0 && conservationDiff <= 0.05 && passengersList.length > 0) {
      const diffToAdjust = Math.round((globalPrice - rawTotalAllocated) * 100) / 100;
      // Trier par nombre de segments utilisés décroissant
      passengersList.sort((a, b) => b.segmentsUsed.length - a.segmentsUsed.length);
      passengersList[0].price = Math.round((passengersList[0].price + diffToAdjust) * 100) / 100;
      finalAllocated = Math.round((rawTotalAllocated + diffToAdjust) * 100) / 100;
      conservationDiff = Math.abs(Math.round((globalPrice - finalAllocated) * 100) / 100);
    }
  }

  const isConservationValid = !allRouteCovered || conservationDiff <= 0.01;

  return {
    tripId,
    globalPrice,
    routeDistanceKm,
    pricePerKm,
    segments,
    passengers: passengersList,
    totalAllocated: finalAllocated,
    conservationValid: isConservationValid,
    conservationDiff,
    status: isConservationValid ? 'VALID' : 'INVALID',
    errorMessage: isConservationValid
      ? undefined
      : `Conservation rule mismatch: sum=${finalAllocated.toFixed(2)} DH, globalPrice=${globalPrice.toFixed(2)} DH (diff=${conservationDiff.toFixed(2)} DH > 0.01)`,
  };
}

/**
 * Format JSON standard pour l'API / réponse de pricing (Section 38)
 */
export function formatPricingResponseJSON(response: PricingEngineResponse): object {
  return {
    tripId: response.tripId,
    globalPrice: response.globalPrice,
    passengers: response.passengers.map((p) => ({
      passengerId: p.passengerId,
      seatUnits: p.seatUnits,
      price: p.price,
    })),
    totalAllocated: response.totalAllocated,
  };
}
