/**
 * PONT ENTRE L'APPLICATION ET LES MOTEURS DE LA SPÉCIFICATION
 *
 * Les écrans manipulent des `Trip` (types.ts). Ce module les convertit en
 * `CanonicalTrip` (géométrie linéarisée) puis délègue toutes les décisions aux
 * moteurs validés par la simulation :
 *   - Matching Engine   → compatible / incompatible + raison (matchingEngine.ts)
 *   - Segment + Pricing → contribution de chaque passager (segmentAndPricingEngine.ts)
 *
 * Aucune règle de matching ou de prix n'est réimplémentée ici (Spécification §39-41).
 */

import { Trip, TripPassenger } from '../types';
import {
  CanonicalTrip,
  MatchingRejectReason,
  MatchingResult,
  MATCHING_CONFIG,
  PassengerRequest,
  linearizeRoute,
  matchPassenger,
  projectPointOnRoute,
} from './matchingEngine';
import {
  BookingSegmentUser,
  PricingEngineResponse,
  calculatePricing,
} from './segmentAndPricingEngine';
import { NamedPoint, normalizePlaceName, resolvePlace } from './places';

export type TripRejectReason =
  | MatchingRejectReason
  | 'UNKNOWN_PLACE'
  | 'TRIP_CLOSED'
  | 'PRICING_INVALID';

export const REJECT_REASON_LABELS: Record<TripRejectReason, string> = {
  DATE: 'Date différente',
  TIME: 'Horaire hors tolérance',
  PICKUP_TOO_FAR: 'Départ trop éloigné du trajet',
  DROPOFF_TOO_FAR: 'Destination trop éloignée du trajet',
  WRONG_DIRECTION: 'Sens inverse du trajet',
  NO_SEATS: 'Plus assez de places',
  UNKNOWN_PLACE: 'Lieu non reconnu',
  TRIP_CLOSED: 'Trajet non réservable',
  PRICING_INVALID: 'Calcul du prix invalide',
};

const BOOKABLE_STATUSES: Trip['status'][] = ['PUBLISHED', 'PARTIALLY_BOOKED', 'FULL'];

// Marge (km) en deçà de laquelle un point est considéré au départ / à l'arrivée du trajet
const ENDPOINT_MARGIN_KM = 0.5;

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

const RELATIVE_DAYS: Record<string, number> = {
  'aujourd hui': 0,
  demain: 1,
  'apres demain': 2,
};

/** "Aujourd'hui" / "Demain" / "Après-demain" / "2026-10-02" → "YYYY-MM-DD" */
export function toIsoDate(label: string, today: Date = new Date()): string {
  const offset = RELATIVE_DAYS[normalizePlaceName(label)];
  if (offset === undefined) return label.trim();
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/* ------------------------------------------------------------------ */
/* Trip → CanonicalTrip                                                */
/* ------------------------------------------------------------------ */

/** Points de passage du conducteur, dans l'ordre (origine, arrêts, destination) */
export function getTripRoutePoints(trip: Trip): NamedPoint[] {
  if (trip.corridor && trip.corridor.length >= 2) {
    return trip.corridor.map((c) => ({ name: c.name, lat: c.lat, lng: c.lng }));
  }
  return [
    { name: trip.origin, lat: trip.origin_lat, lng: trip.origin_lng },
    { name: trip.destination, lat: trip.destination_lat, lng: trip.destination_lng },
  ];
}

export function tripToCanonical(trip: Trip): CanonicalTrip {
  const { geometry, totalDistanceKm } = linearizeRoute(
    getTripRoutePoints(trip).map((p) => ({ lat: p.lat, lng: p.lng, label: p.name }))
  );
  return {
    id: trip.id,
    driverId: trip.driver_id,
    driverName: trip.driver.first_name,
    origin: trip.origin,
    destination: trip.destination,
    originLat: trip.origin_lat,
    originLng: trip.origin_lng,
    destinationLat: trip.destination_lat,
    destinationLng: trip.destination_lng,
    departureTime: trip.departure_time,
    date: toIsoDate(trip.date),
    totalSeats: trip.available_seats,
    reservedSeatUnits: trip.reserved_seats,
    globalPrice: trip.global_price,
    routeGeometry: geometry,
    routeDistanceKm: totalDistanceKm,
    status: trip.status === 'DRAFT' ? 'PUBLISHED' : trip.status,
  };
}

/* ------------------------------------------------------------------ */
/* Localisation d'un lieu sur la route du conducteur                   */
/* ------------------------------------------------------------------ */

export interface RouteLocation {
  lat: number;
  lng: number;
  precisionMeters: number;
  positionKm: number;
  distanceFromRouteMeters: number;
}

export function locateOnTrip(
  trip: Trip,
  canonical: CanonicalTrip,
  label: string
): RouteLocation | null {
  const routePoints = getTripRoutePoints(trip);
  const query = normalizePlaceName(label);

  // Un arrêt du corridor est prioritaire : ses coordonnées sont exactes
  const stop = routePoints.find((p) => normalizePlaceName(p.name) === query);
  const place = stop ? { ...stop, precisionMeters: 0 } : resolvePlace(label, routePoints);
  if (!place) return null;

  const projection = projectPointOnRoute(place, canonical.routeGeometry);
  return {
    lat: place.lat,
    lng: place.lng,
    precisionMeters: place.precisionMeters,
    positionKm: projection.routePositionKm,
    distanceFromRouteMeters: projection.distanceFromRouteMeters,
  };
}

/** Nom de l'arrêt du corridor le plus proche d'une position sur la route */
export function nearestStopName(canonical: CanonicalTrip, positionKm: number): string {
  let best = canonical.routeGeometry[0];
  for (const p of canonical.routeGeometry) {
    if (Math.abs(p.routePositionKm - positionKm) < Math.abs(best.routePositionKm - positionKm)) {
      best = p;
    }
  }
  return best?.label || '';
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

/** Réservations déjà présentes sur le trajet, exprimées en seat units positionnées */
function existingSeatUnits(trip: Trip, canonical: CanonicalTrip): BookingSegmentUser[] {
  return trip.passengers.map((p, idx) => {
    const pickup = locateOnTrip(trip, canonical, p.pickup_point);
    const dropoff = locateOnTrip(trip, canonical, p.dropoff_point);
    return {
      passengerId: `pax_${idx}`,
      passengerName: p.name,
      seatUnits: p.seats,
      pickupPositionKm: pickup ? pickup.positionKm : 0,
      dropoffPositionKm: dropoff ? dropoff.positionKm : canonical.routeDistanceKm,
    };
  });
}

const NEW_BOOKING_ID = 'new_booking';

function priceWithNewBooking(
  trip: Trip,
  canonical: CanonicalTrip,
  pickupKm: number,
  dropoffKm: number,
  seatUnits: number
): { price: number; pricing: PricingEngineResponse } {
  const pricing = calculatePricing(trip.id, trip.global_price, canonical.routeDistanceKm, [
    ...existingSeatUnits(trip, canonical),
    {
      passengerId: NEW_BOOKING_ID,
      seatUnits,
      pickupPositionKm: pickupKm,
      dropoffPositionKm: dropoffKm,
    },
  ]);
  const price = pricing.passengers.find((p) => p.passengerId === NEW_BOOKING_ID)?.price ?? 0;
  return { price, pricing };
}

/**
 * Recalcule la contribution de chaque passager déjà présent (Spécification
 * §36 : POST /trips/:tripId/recalculate). À appeler après chaque ajout ou
 * annulation de réservation.
 */
export function repriceTrip(trip: Trip): { trip: Trip; pricing: PricingEngineResponse } {
  const canonical = tripToCanonical(trip);
  const pricing = calculatePricing(
    trip.id,
    trip.global_price,
    canonical.routeDistanceKm,
    existingSeatUnits(trip, canonical)
  );
  const passengers: TripPassenger[] = trip.passengers.map((p, idx) => ({
    ...p,
    contribution_dh: pricing.passengers.find((r) => r.passengerId === `pax_${idx}`)?.price ?? 0,
  }));
  return { trip: { ...trip, passengers }, pricing };
}

/* ------------------------------------------------------------------ */
/* Devis de réservation (matching + prix)                              */
/* ------------------------------------------------------------------ */

export interface BookingQuote {
  compatible: boolean;
  reason: TripRejectReason | null;
  match: MatchingResult | null;
  pickupKm: number;
  dropoffKm: number;
  routeDistanceKm: number;
  price: number;
  pricing: PricingEngineResponse | null;
}

export interface QuoteOptions {
  date?: string; // date demandée par le passager (défaut : date du trajet)
  time?: string; // heure demandée (défaut : heure du trajet)
  toleranceMinutes?: number;
}

export function quoteBooking(
  trip: Trip,
  pickupLabel: string,
  dropoffLabel: string,
  seatUnits: number,
  options: QuoteOptions = {}
): BookingQuote {
  const canonical = tripToCanonical(trip);
  const rejected = (reason: TripRejectReason, match: MatchingResult | null = null): BookingQuote => ({
    compatible: false,
    reason,
    match,
    pickupKm: match?.pickupPositionKm ?? 0,
    dropoffKm: match?.dropoffPositionKm ?? 0,
    routeDistanceKm: canonical.routeDistanceKm,
    price: 0,
    pricing: null,
  });

  if (!BOOKABLE_STATUSES.includes(trip.status)) return rejected('TRIP_CLOSED');

  const pickup = locateOnTrip(trip, canonical, pickupLabel);
  const dropoff = locateOnTrip(trip, canonical, dropoffLabel);
  if (!pickup || !dropoff) return rejected('UNKNOWN_PLACE');

  const request: PassengerRequest = {
    id: NEW_BOOKING_ID,
    name: '',
    pickupLat: pickup.lat,
    pickupLng: pickup.lng,
    pickupLabel,
    dropoffLat: dropoff.lat,
    dropoffLng: dropoff.lng,
    dropoffLabel,
    date: options.date ? toIsoDate(options.date) : canonical.date,
    departureTime: options.time || trip.departure_time,
    seats: seatUnits,
    pickupPrecisionMeters: pickup.precisionMeters,
    dropoffPrecisionMeters: dropoff.precisionMeters,
  };

  const match = matchPassenger(request, canonical, {
    ...MATCHING_CONFIG,
    TIME_TOLERANCE_MINUTES: options.toleranceMinutes ?? MATCHING_CONFIG.TIME_TOLERANCE_MINUTES,
  });
  if (!match.compatible) return rejected(match.reason as MatchingRejectReason, match);

  const { price, pricing } = priceWithNewBooking(
    trip,
    canonical,
    match.pickupPositionKm,
    match.dropoffPositionKm,
    seatUnits
  );
  // Règle de conservation (§28) : ne jamais confirmer un prix invalide
  if (pricing.status !== 'VALID') return rejected('PRICING_INVALID', match);

  return {
    compatible: true,
    reason: null,
    match,
    pickupKm: match.pickupPositionKm,
    dropoffKm: match.dropoffPositionKm,
    routeDistanceKm: canonical.routeDistanceKm,
    price,
    pricing,
  };
}

/* ------------------------------------------------------------------ */
/* Recherche                                                           */
/* ------------------------------------------------------------------ */

export interface TripSearch {
  origin: string;
  destination: string;
  date: string;
  time: string;
  toleranceMinutes?: number;
  seats?: number;
}

export interface TripMatchEvaluation {
  trip: Trip;
  isMatch: boolean;
  rejectReason: TripRejectReason | null;
  matchType: 'exact' | 'compatible';
  score: number; // 0-100, usage interne pour le classement (§15)
  matchLabel: string; // « Très compatible », « Compatible », « Trajet proche » (Cahier §27)
  pickupPoint: string;
  dropoffPoint: string;
  calculatedPrice: number;
  isSegment: boolean;
  segmentDistanceKm: number;
}

function compatibilityLabel(score: number): string {
  if (score >= 80) return 'Très compatible';
  if (score >= 60) return 'Compatible';
  return 'Trajet proche';
}

export function evaluateTripMatch(trip: Trip, search: TripSearch): TripMatchEvaluation {
  const canonical = tripToCanonical(trip);
  const seats = Math.max(1, search.seats || 1);
  const browsing = !search.origin.trim() && !search.destination.trim();
  // Départ et arrivée du conducteur = premier et dernier arrêt (coordonnées exactes)
  const routePointsOfTrip = getTripRoutePoints(trip);
  const tripStart = routePointsOfTrip[0].name;
  const tripEnd = routePointsOfTrip[routePointsOfTrip.length - 1].name;

  // Sans départ ni destination : on affiche le trajet entier, sans filtre horaire
  const quote = browsing
    ? quoteBooking(trip, tripStart, tripEnd, seats)
    : quoteBooking(
        trip,
        search.origin.trim() || tripStart,
        search.destination.trim() || tripEnd,
        seats,
        { date: search.date, time: search.time, toleranceMinutes: search.toleranceMinutes }
      );

  const pickupKm = quote.compatible ? quote.pickupKm : 0;
  const dropoffKm = quote.compatible ? quote.dropoffKm : canonical.routeDistanceKm;
  const pickupPoint = nearestStopName(canonical, pickupKm);
  const dropoffPoint = nearestStopName(canonical, dropoffKm);
  const routePoints = canonical.routeGeometry;
  // Exact : le passager monte au départ et descend à l'arrivée du conducteur
  // (au plus proche arrêt, pour couvrir une recherche au niveau de la ville)
  const isFullRoute =
    (pickupKm <= ENDPOINT_MARGIN_KM || pickupPoint === routePoints[0]?.label) &&
    (dropoffKm >= canonical.routeDistanceKm - ENDPOINT_MARGIN_KM ||
      dropoffPoint === routePoints[routePoints.length - 1]?.label);

  // Un trajet complet reste visible en navigation libre (« 4/4 — Complet »)
  const visibleWhenBrowsing = browsing && (quote.compatible || quote.reason === 'NO_SEATS');
  const price = quote.compatible
    ? quote.price
    : priceWithNewBooking(trip, canonical, pickupKm, dropoffKm, seats).price;

  return {
    trip,
    isMatch: quote.compatible || visibleWhenBrowsing,
    rejectReason: quote.reason,
    matchType: isFullRoute ? 'exact' : 'compatible',
    score: quote.match?.score ?? 0,
    matchLabel: isFullRoute
      ? 'Correspondance exacte'
      : compatibilityLabel(quote.match?.score ?? 0),
    pickupPoint,
    dropoffPoint,
    calculatedPrice: price,
    isSegment: !isFullRoute,
    segmentDistanceKm: Math.round((dropoffKm - pickupKm) * 10) / 10,
  };
}

/** Affichage d'un montant : "45" ou "8.71" */
export function formatDh(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
