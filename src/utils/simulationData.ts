/**
 * Données canoniques de test et scénario de simulation
 * Conforme aux Sections 30, 31, 32, 33, 34 de la Spécification Technique
 */

import { CanonicalTrip, PassengerRequest, RoutePoint } from './matchingEngine';
import { BookingSegmentUser } from './segmentAndPricingEngine';

// Coordonnées réelles étalonnées pour correspondre exactement à la linéarisation 1D de la spécification (Section 4 & 16)
// Targa = 0.0 km, Guéliz = 4.8 km, Hivernage = 8.1 km, Médina = 12.4 km
export const SIMULATION_ROUTE_GEOMETRY: RoutePoint[] = [
  { lat: 31.6425, lng: -8.0418, routePositionKm: 0.0, label: 'Targa' },
  { lat: 31.6385, lng: -8.0270, routePositionKm: 2.4, label: 'Route de Targa' },
  { lat: 31.6346, lng: -8.0125, routePositionKm: 4.8, label: 'Guéliz' },
  { lat: 31.6280, lng: -8.0090, routePositionKm: 6.5, label: 'Bd Mohammed V' },
  { lat: 31.6241, lng: -8.0054, routePositionKm: 8.1, label: 'Hivernage' },
  { lat: 31.6268, lng: -7.9930, routePositionKm: 10.2, label: 'Bab Jdid' },
  { lat: 31.6295, lng: -7.9811, routePositionKm: 12.4, label: 'Médina' },
];

// TRIP #SIM-001 (Section 30)
export const TRIP_SIM_001: CanonicalTrip = {
  id: 'SIM-001',
  driverId: 'user_yassine',
  driverName: 'Yassine',
  origin: 'Targa, Marrakech',
  destination: 'Médina, Marrakech',
  originLat: 31.6425,
  originLng: -8.0418,
  destinationLat: 31.6295,
  destinationLng: -7.9811,
  departureTime: '08:00',
  date: "Aujourd'hui",
  totalSeats: 4,
  reservedSeatUnits: 0,
  globalPrice: 45.0, // 45 DH
  routeGeometry: SIMULATION_ROUTE_GEOMETRY,
  routeDistanceKm: 12.4, // 12.4 km (Section 4 & 16)
  status: 'PUBLISHED',
};

// 5 Passagers de test (Section 31)
export const SIMULATION_TEST_PASSENGERS: PassengerRequest[] = [
  {
    id: 'P1',
    name: 'P1 (Targa → Guéliz)',
    pickupLat: 31.6425,
    pickupLng: -8.0418, // Targa (0.0 km, distance ~0m)
    pickupLabel: 'Targa',
    dropoffLat: 31.6346,
    dropoffLng: -8.0125, // Guéliz (4.8 km, distance ~0m)
    dropoffLabel: 'Guéliz',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  },
  {
    id: 'P2',
    name: 'P2 (Targa → Médina)',
    pickupLat: 31.6425,
    pickupLng: -8.0418, // Targa (0.0 km)
    pickupLabel: 'Targa',
    dropoffLat: 31.6295,
    dropoffLng: -7.9811, // Médina (12.4 km)
    dropoffLabel: 'Médina',
    date: "Aujourd'hui",
    departureTime: '08:02', // +2 min
    seats: 1,
  },
  {
    id: 'P3',
    name: 'P3 (Guéliz → Médina)',
    pickupLat: 31.6346,
    pickupLng: -8.0125, // Guéliz (4.8 km, ~120m corridor)
    pickupLabel: 'Guéliz',
    dropoffLat: 31.6295,
    dropoffLng: -7.9811, // Médina (12.4 km, ~180m corridor)
    dropoffLabel: 'Médina',
    date: "Aujourd'hui",
    departureTime: '08:05', // +5 min
    seats: 1,
  },
  {
    id: 'P4',
    name: 'P4 (Médina → Targa - Mauvais sens)',
    pickupLat: 31.6295,
    pickupLng: -7.9811, // Médina (12.4 km)
    pickupLabel: 'Médina',
    dropoffLat: 31.6425,
    dropoffLng: -8.0418, // Targa (0.0 km)
    dropoffLabel: 'Targa',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  },
  {
    id: 'P5',
    name: 'P5 (Targa → Sidi Ghanem - Hors corridor)',
    pickupLat: 31.6425,
    pickupLng: -8.0418, // Targa
    pickupLabel: 'Targa',
    dropoffLat: 31.6675,
    dropoffLng: -8.0284, // Sidi Ghanem (> 2500m de la route)
    dropoffLabel: 'Sidi Ghanem',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  },
];

// Scénario de 3 passagers chevauchants de la Section 23
export const THREE_OVERLAPPING_PASSENGERS: BookingSegmentUser[] = [
  {
    passengerId: 'P1',
    passengerName: 'P1',
    seatUnits: 1,
    pickupPositionKm: 0.0,
    dropoffPositionKm: 4.8, // S1
  },
  {
    passengerId: 'P2',
    passengerName: 'P2',
    seatUnits: 1,
    pickupPositionKm: 0.0,
    dropoffPositionKm: 12.4, // S1 + S2 + S3
  },
  {
    passengerId: 'P3',
    passengerName: 'P3',
    seatUnits: 1,
    pickupPositionKm: 4.8,
    dropoffPositionKm: 12.4, // S2 + S3
  },
];
