/**
 * MATCHING ENGINE - Conforme à la Spécification Technique Routa Maroc (Pages 2-4)
 * - Trajet conducteur = objet canonique
 * - Route Geometry & Linéarisation 1D (routePositionKm)
 * - Projection point-to-route (pickup & dropoff)
 * - Corridor distance check (MAX_CORRIDOR_DISTANCE configurable, default 500m)
 * - Direction & ordre (pickupPositionKm < dropoffPositionKm)
 * - Compatibilité horaire (TIME_TOLERANCE configurable, default 15 min)
 * - Disponibilité des places en Seat Units
 * - Scoring de classement (0-100)
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RoutePoint extends LatLng {
  routePositionKm: number;
  label?: string;
}

export interface RouteGeometryPoint extends LatLng {
  name?: string;
}

export interface CanonicalTrip {
  id: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  departureTime: string; // "HH:MM"
  date: string;
  totalSeats: number;
  reservedSeatUnits: number;
  globalPrice: number; // e.g. 45.00 DH
  routeGeometry: RoutePoint[];
  routeDistanceKm: number; // e.g. 12.4 km
  status: 'PUBLISHED' | 'PARTIALLY_BOOKED' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface PassengerRequest {
  id: string;
  name: string;
  pickupLat: number;
  pickupLng: number;
  pickupLabel: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffLabel: string;
  date: string;
  departureTime: string;
  seats: number;
  // Incertitude du point (0 = point précis). Un nom de ville couvre toute
  // l'agglomération : la tolérance de corridor est élargie d'autant.
  pickupPrecisionMeters?: number;
  dropoffPrecisionMeters?: number;
}

export interface ProjectionResult {
  distanceFromRouteMeters: number;
  routePositionKm: number;
}

export type MatchingRejectReason =
  | 'DATE'
  | 'TIME'
  | 'PICKUP_TOO_FAR'
  | 'DROPOFF_TOO_FAR'
  | 'WRONG_DIRECTION'
  | 'NO_SEATS';

export interface MatchingResult {
  tripId: string;
  passengerId: string;
  compatible: boolean;
  reason: MatchingRejectReason | null;
  pickupPositionKm: number;
  dropoffPositionKm: number;
  pickupDistanceMeters: number;
  dropoffDistanceMeters: number;
  timeDifferenceMinutes: number;
  directionOk: boolean;
  seatsAvailable: number;
  score: number; // 0-100
  debugMessage?: string;
}

// Paramètres configurables (Section 9 & 11)
export const MATCHING_CONFIG = {
  MAX_CORRIDOR_DISTANCE_METERS: 500, // 500 m par défaut (Section 9)
  TIME_TOLERANCE_MINUTES: 15, // ±15 minutes (Section 11)
  CANDIDATE_SEARCH_RADIUS_KM: 2.0, // 2 km (Section 6)
};

/**
 * Calcule la distance géodésique en mètres entre deux coordonnées (Haversine)
 */
export function haversineDistanceMeters(p1: LatLng, p2: LatLng): number {
  const R = 6371000; // Rayon terre en mètres
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Linéarise une liste de points GPS en calculant la distance cumulée (routePositionKm)
 */
export function linearizeRoute(rawPoints: { lat: number; lng: number; label?: string }[]): {
  geometry: RoutePoint[];
  totalDistanceKm: number;
} {
  if (!rawPoints || rawPoints.length === 0) {
    return { geometry: [], totalDistanceKm: 0 };
  }

  const geometry: RoutePoint[] = [
    {
      lat: rawPoints[0].lat,
      lng: rawPoints[0].lng,
      routePositionKm: 0.0,
      label: rawPoints[0].label,
    },
  ];

  let cumulativeMeters = 0;
  for (let i = 1; i < rawPoints.length; i++) {
    const dist = haversineDistanceMeters(rawPoints[i - 1], rawPoints[i]);
    cumulativeMeters += dist;
    geometry.push({
      lat: rawPoints[i].lat,
      lng: rawPoints[i].lng,
      routePositionKm: Math.round((cumulativeMeters / 1000) * 10) / 10,
      label: rawPoints[i].label,
    });
  }

  const totalDistanceKm = Math.round((cumulativeMeters / 1000) * 10) / 10;
  return { geometry, totalDistanceKm };
}

/**
 * Projette un point passager sur la géométrie de la route du conducteur (Sections 7 & 8)
 * Retourne la distance au trajet en mètres et la position linéaire sur la route en km.
 */
export function projectPointOnRoute(
  point: LatLng,
  routeGeometry: RoutePoint[]
): ProjectionResult {
  if (!routeGeometry || routeGeometry.length === 0) {
    return { distanceFromRouteMeters: 9999, routePositionKm: 0 };
  }

  let minDistanceMeters = Infinity;
  let bestRoutePositionKm = 0;

  for (let i = 0; i < routeGeometry.length - 1; i++) {
    const a = routeGeometry[i];
    const b = routeGeometry[i + 1];

    // Projection sur le segment [a, b]
    const segMeters = haversineDistanceMeters(a, b);
    const distA = haversineDistanceMeters(point, a);
    const distB = haversineDistanceMeters(point, b);

    // Paramètre t de projection (approximation plane locale)
    let t = 0;
    if (segMeters > 0) {
      // Formule vectorielle simplifiée
      const dx = b.lng - a.lng;
      const dy = b.lat - a.lat;
      const dpx = point.lng - a.lng;
      const dpy = point.lat - a.lat;
      const dot = dpx * dx + dpy * dy;
      const lenSq = dx * dx + dy * dy;
      t = lenSq > 0 ? Math.max(0, Math.min(1, dot / lenSq)) : 0;
    }

    // Coordonnées projetées
    const projLat = a.lat + t * (b.lat - a.lat);
    const projLng = a.lng + t * (b.lng - a.lng);
    const distToSegment = haversineDistanceMeters(point, { lat: projLat, lng: projLng });

    if (distToSegment < minDistanceMeters) {
      minDistanceMeters = distToSegment;
      const segDistanceKm = b.routePositionKm - a.routePositionKm;
      bestRoutePositionKm = Math.round((a.routePositionKm + t * segDistanceKm) * 10) / 10;
    }
  }

  // Vérifier aussi le dernier point seul
  const lastPoint = routeGeometry[routeGeometry.length - 1];
  const distLast = haversineDistanceMeters(point, lastPoint);
  if (distLast < minDistanceMeters) {
    minDistanceMeters = distLast;
    bestRoutePositionKm = lastPoint.routePositionKm;
  }

  return {
    distanceFromRouteMeters: Math.round(minDistanceMeters),
    routePositionKm: bestRoutePositionKm,
  };
}

/**
 * Convertit "HH:MM" en minutes depuis minuit
 */
export function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

/**
 * Calcule le score de classement (Section 15)
 * Pickup proximity (30), dropoff proximity (30), time proximity (20), corridor quality (15), seat availability (5)
 */
export function calculateCompatibilityScore(
  pickupDistanceMeters: number,
  dropoffDistanceMeters: number,
  timeDiffMinutes: number,
  maxCorridorMeters: number = 500,
  maxTimeTolerance: number = 15
): number {
  const pickupScore = Math.max(0, 30 * (1 - pickupDistanceMeters / maxCorridorMeters));
  const dropoffScore = Math.max(0, 30 * (1 - dropoffDistanceMeters / maxCorridorMeters));
  const timeScore = Math.max(0, 20 * (1 - timeDiffMinutes / maxTimeTolerance));
  const corridorQuality = 15; // Les deux sont dans le corridor
  const seatScore = 5;

  return Math.round(pickupScore + dropoffScore + timeScore + corridorQuality + seatScore);
}

/**
 * ALGORITHME COMPLET DE MATCHING (Section 13)
 * Vérifie toutes les règles obligatoires et projette pickup/dropoff
 */
export function matchPassenger(
  passenger: PassengerRequest,
  trip: CanonicalTrip,
  config = MATCHING_CONFIG
): MatchingResult {
  // 1. Compatibilité de date
  if (passenger.date !== trip.date) {
    return {
      tripId: trip.id,
      passengerId: passenger.id,
      compatible: false,
      reason: 'DATE',
      pickupPositionKm: 0,
      dropoffPositionKm: 0,
      pickupDistanceMeters: 0,
      dropoffDistanceMeters: 0,
      timeDifferenceMinutes: 0,
      directionOk: false,
      seatsAvailable: trip.totalSeats - trip.reservedSeatUnits,
      score: 0,
      debugMessage: `Date mismatch: passenger=${passenger.date}, trip=${trip.date}`,
    };
  }

  // 2. Compatibilité horaire (Section 11)
  const pMin = parseTimeToMinutes(passenger.departureTime);
  const tMin = parseTimeToMinutes(trip.departureTime);
  const timeDiff = Math.abs(pMin - tMin);

  if (timeDiff > config.TIME_TOLERANCE_MINUTES) {
    return {
      tripId: trip.id,
      passengerId: passenger.id,
      compatible: false,
      reason: 'TIME',
      pickupPositionKm: 0,
      dropoffPositionKm: 0,
      pickupDistanceMeters: 0,
      dropoffDistanceMeters: 0,
      timeDifferenceMinutes: timeDiff,
      directionOk: false,
      seatsAvailable: trip.totalSeats - trip.reservedSeatUnits,
      score: 0,
      debugMessage: `Time diff ${timeDiff} min > max tolerance ${config.TIME_TOLERANCE_MINUTES} min`,
    };
  }

  // 3. Projection du pickup & dropoff sur la route (Sections 7 & 8)
  const pickup = projectPointOnRoute(
    { lat: passenger.pickupLat, lng: passenger.pickupLng },
    trip.routeGeometry
  );
  const dropoff = projectPointOnRoute(
    { lat: passenger.dropoffLat, lng: passenger.dropoffLng },
    trip.routeGeometry
  );

  // 4. Distance au corridor (Section 9)
  const pickupMaxMeters = config.MAX_CORRIDOR_DISTANCE_METERS + (passenger.pickupPrecisionMeters || 0);
  const dropoffMaxMeters = config.MAX_CORRIDOR_DISTANCE_METERS + (passenger.dropoffPrecisionMeters || 0);

  if (pickup.distanceFromRouteMeters > pickupMaxMeters) {
    return {
      tripId: trip.id,
      passengerId: passenger.id,
      compatible: false,
      reason: 'PICKUP_TOO_FAR',
      pickupPositionKm: pickup.routePositionKm,
      dropoffPositionKm: dropoff.routePositionKm,
      pickupDistanceMeters: pickup.distanceFromRouteMeters,
      dropoffDistanceMeters: dropoff.distanceFromRouteMeters,
      timeDifferenceMinutes: timeDiff,
      directionOk: pickup.routePositionKm < dropoff.routePositionKm,
      seatsAvailable: trip.totalSeats - trip.reservedSeatUnits,
      score: 0,
      debugMessage: `Pickup is ${pickup.distanceFromRouteMeters}m away (> ${pickupMaxMeters}m)`,
    };
  }

  if (dropoff.distanceFromRouteMeters > dropoffMaxMeters) {
    return {
      tripId: trip.id,
      passengerId: passenger.id,
      compatible: false,
      reason: 'DROPOFF_TOO_FAR',
      pickupPositionKm: pickup.routePositionKm,
      dropoffPositionKm: dropoff.routePositionKm,
      pickupDistanceMeters: pickup.distanceFromRouteMeters,
      dropoffDistanceMeters: dropoff.distanceFromRouteMeters,
      timeDifferenceMinutes: timeDiff,
      directionOk: pickup.routePositionKm < dropoff.routePositionKm,
      seatsAvailable: trip.totalSeats - trip.reservedSeatUnits,
      score: 0,
      debugMessage: `Dropoff is ${dropoff.distanceFromRouteMeters}m away (> ${dropoffMaxMeters}m)`,
    };
  }

  // 5. Direction et ordre (Section 10)
  const directionOk = pickup.routePositionKm < dropoff.routePositionKm;
  if (!directionOk) {
    return {
      tripId: trip.id,
      passengerId: passenger.id,
      compatible: false,
      reason: 'WRONG_DIRECTION',
      pickupPositionKm: pickup.routePositionKm,
      dropoffPositionKm: dropoff.routePositionKm,
      pickupDistanceMeters: pickup.distanceFromRouteMeters,
      dropoffDistanceMeters: dropoff.distanceFromRouteMeters,
      timeDifferenceMinutes: timeDiff,
      directionOk: false,
      seatsAvailable: trip.totalSeats - trip.reservedSeatUnits,
      score: 0,
      debugMessage: `Wrong direction: pickup at ${pickup.routePositionKm}km >= dropoff at ${dropoff.routePositionKm}km`,
    };
  }

  // 6. Places disponibles en Seat Units (Section 12)
  const availableSeats = trip.totalSeats - trip.reservedSeatUnits;
  if (availableSeats < passenger.seats) {
    return {
      tripId: trip.id,
      passengerId: passenger.id,
      compatible: false,
      reason: 'NO_SEATS',
      pickupPositionKm: pickup.routePositionKm,
      dropoffPositionKm: dropoff.routePositionKm,
      pickupDistanceMeters: pickup.distanceFromRouteMeters,
      dropoffDistanceMeters: dropoff.distanceFromRouteMeters,
      timeDifferenceMinutes: timeDiff,
      directionOk: true,
      seatsAvailable: availableSeats,
      score: 0,
      debugMessage: `Available seats ${availableSeats} < requested ${passenger.seats}`,
    };
  }

  // 7. COMPATIBLE : Calcul du score de classement (Section 15)
  const score = calculateCompatibilityScore(
    pickup.distanceFromRouteMeters * (config.MAX_CORRIDOR_DISTANCE_METERS / pickupMaxMeters),
    dropoff.distanceFromRouteMeters * (config.MAX_CORRIDOR_DISTANCE_METERS / dropoffMaxMeters),
    timeDiff,
    config.MAX_CORRIDOR_DISTANCE_METERS,
    config.TIME_TOLERANCE_MINUTES
  );

  return {
    tripId: trip.id,
    passengerId: passenger.id,
    compatible: true,
    reason: null,
    pickupPositionKm: pickup.routePositionKm,
    dropoffPositionKm: dropoff.routePositionKm,
    pickupDistanceMeters: pickup.distanceFromRouteMeters,
    dropoffDistanceMeters: dropoff.distanceFromRouteMeters,
    timeDifferenceMinutes: timeDiff,
    directionOk: true,
    seatsAvailable: availableSeats,
    score,
    debugMessage: `MATCH ACCEPTED: pickup=${pickup.routePositionKm}km (${pickup.distanceFromRouteMeters}m), dropoff=${dropoff.routePositionKm}km (${dropoff.distanceFromRouteMeters}m), timeDiff=${timeDiff}min`,
  };
}
