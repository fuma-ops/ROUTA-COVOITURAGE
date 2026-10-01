/**
 * SUITE DE TESTS OBLIGATOIRES (Section 34)
 * Exécute automatiquement les 12 tests requis par la spécification technique
 */

import { matchPassenger, CanonicalTrip, PassengerRequest } from './matchingEngine';
import { calculatePricing, BookingSegmentUser } from './segmentAndPricingEngine';
import { TRIP_SIM_001 } from './simulationData';

export interface TestResultItem {
  id: number;
  name: string;
  category: 'MATCHING' | 'PRICING' | 'CAPACITY';
  expected: string;
  actual: string;
  passed: boolean;
  details: string;
}

export function runMandatoryTestSuite(): {
  results: TestResultItem[];
  totalPassed: number;
  totalTests: number;
} {
  const trip = { ...TRIP_SIM_001 };
  const results: TestResultItem[] = [];

  // Test 1: Même trajet (Targa 0.0km -> Médina 12.4km, 08:00) => MATCH
  const t1Passenger: PassengerRequest = {
    id: 'T1',
    name: 'Même trajet',
    pickupLat: 31.6425,
    pickupLng: -8.0418,
    pickupLabel: 'Targa',
    dropoffLat: 31.6295,
    dropoffLng: -7.9811,
    dropoffLabel: 'Médina',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  };
  const res1 = matchPassenger(t1Passenger, trip);
  results.push({
    id: 1,
    name: 'Même trajet',
    category: 'MATCHING',
    expected: 'MATCH',
    actual: res1.compatible ? 'MATCH' : `REJECT (${res1.reason})`,
    passed: res1.compatible === true,
    details: `Targa (0km) → Médina (12.4km) : compatible=${res1.compatible}, score=${res1.score}/100`,
  });

  // Test 2: Destination intermédiaire (Targa 0.0km -> Guéliz 4.8km, 08:00) => MATCH
  const t2Passenger: PassengerRequest = {
    id: 'T2',
    name: 'Destination intermédiaire',
    pickupLat: 31.6425,
    pickupLng: -8.0418,
    pickupLabel: 'Targa',
    dropoffLat: 31.6346,
    dropoffLng: -8.0125,
    dropoffLabel: 'Guéliz',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  };
  const res2 = matchPassenger(t2Passenger, trip);
  results.push({
    id: 2,
    name: 'Destination intermédiaire',
    category: 'MATCHING',
    expected: 'MATCH',
    actual: res2.compatible ? 'MATCH' : `REJECT (${res2.reason})`,
    passed: res2.compatible === true,
    details: `Targa (0km) → Guéliz (4.8km) : compatible=${res2.compatible}`,
  });

  // Test 3: Départ intermédiaire (Guéliz 4.8km -> Médina 12.4km, 08:05) => MATCH
  const t3Passenger: PassengerRequest = {
    id: 'T3',
    name: 'Départ intermédiaire',
    pickupLat: 31.6346,
    pickupLng: -8.0125,
    pickupLabel: 'Guéliz',
    dropoffLat: 31.6295,
    dropoffLng: -7.9811,
    dropoffLabel: 'Médina',
    date: "Aujourd'hui",
    departureTime: '08:05',
    seats: 1,
  };
  const res3 = matchPassenger(t3Passenger, trip);
  results.push({
    id: 3,
    name: 'Départ intermédiaire',
    category: 'MATCHING',
    expected: 'MATCH',
    actual: res3.compatible ? 'MATCH' : `REJECT (${res3.reason})`,
    passed: res3.compatible === true,
    details: `Guéliz (4.8km) → Médina (12.4km) : compatible=${res3.compatible}, timeDiff=5min`,
  });

  // Test 4: Départ + destination intermédiaires (Guéliz 4.8km -> Hivernage 8.1km, 08:05) => MATCH
  const t4Passenger: PassengerRequest = {
    id: 'T4',
    name: 'Départ + destination intermédiaires',
    pickupLat: 31.6346,
    pickupLng: -8.0125,
    pickupLabel: 'Guéliz',
    dropoffLat: 31.6241,
    dropoffLng: -8.0054,
    dropoffLabel: 'Hivernage',
    date: "Aujourd'hui",
    departureTime: '08:05',
    seats: 1,
  };
  const res4 = matchPassenger(t4Passenger, trip);
  results.push({
    id: 4,
    name: 'Départ + destination intermédiaires',
    category: 'MATCHING',
    expected: 'MATCH',
    actual: res4.compatible ? 'MATCH' : `REJECT (${res4.reason})`,
    passed: res4.compatible === true,
    details: `Guéliz (4.8km) → Hivernage (8.1km) : compatible=${res4.compatible}`,
  });

  // Test 5: Mauvaise direction (Médina 12.4km -> Targa 0.0km) => REJECT (WRONG_DIRECTION)
  const t5Passenger: PassengerRequest = {
    id: 'T5',
    name: 'Mauvaise direction',
    pickupLat: 31.6295,
    pickupLng: -7.9811,
    pickupLabel: 'Médina',
    dropoffLat: 31.6425,
    dropoffLng: -8.0418,
    dropoffLabel: 'Targa',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  };
  const res5 = matchPassenger(t5Passenger, trip);
  results.push({
    id: 5,
    name: 'Mauvaise direction',
    category: 'MATCHING',
    expected: 'REJECT (WRONG_DIRECTION)',
    actual: res5.compatible ? 'MATCH' : `REJECT (${res5.reason})`,
    passed: res5.compatible === false && res5.reason === 'WRONG_DIRECTION',
    details: `Sens inverse 12.4km → 0km : rejeté avec code ${res5.reason}`,
  });

  // Test 6: Pickup trop loin (> 500m de la route) => REJECT (PICKUP_TOO_FAR)
  const t6Passenger: PassengerRequest = {
    id: 'T6',
    name: 'Pickup trop loin',
    pickupLat: 31.6675,
    pickupLng: -8.0284, // Sidi Ghanem (> 2500m de la route Targa-Guéliz)
    pickupLabel: 'Sidi Ghanem',
    dropoffLat: 31.6295,
    dropoffLng: -7.9811,
    dropoffLabel: 'Médina',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  };
  const res6 = matchPassenger(t6Passenger, trip);
  results.push({
    id: 6,
    name: 'Pickup trop loin',
    category: 'MATCHING',
    expected: 'REJECT (PICKUP_TOO_FAR)',
    actual: res6.compatible ? 'MATCH' : `REJECT (${res6.reason})`,
    passed: res6.compatible === false && res6.reason === 'PICKUP_TOO_FAR',
    details: `Distance pickup=${res6.pickupDistanceMeters}m > 500m : rejeté (${res6.reason})`,
  });

  // Test 7: Dropoff trop loin (> 500m de la route) => REJECT (DROPOFF_TOO_FAR)
  const t7Passenger: PassengerRequest = {
    id: 'T7',
    name: 'Dropoff trop loin',
    pickupLat: 31.6425,
    pickupLng: -8.0418,
    pickupLabel: 'Targa',
    dropoffLat: 31.6675,
    dropoffLng: -8.0284, // Sidi Ghanem
    dropoffLabel: 'Sidi Ghanem',
    date: "Aujourd'hui",
    departureTime: '08:00',
    seats: 1,
  };
  const res7 = matchPassenger(t7Passenger, trip);
  results.push({
    id: 7,
    name: 'Dropoff trop loin',
    category: 'MATCHING',
    expected: 'REJECT (DROPOFF_TOO_FAR)',
    actual: res7.compatible ? 'MATCH' : `REJECT (${res7.reason})`,
    passed: res7.compatible === false && res7.reason === 'DROPOFF_TOO_FAR',
    details: `Distance dropoff=${res7.dropoffDistanceMeters}m > 500m : rejeté (${res7.reason})`,
  });

  // Test 8: Horaire hors tolérance (> ±15 min, ex: 08:35 vs 08:00 = 35 min) => REJECT (TIME)
  const t8Passenger: PassengerRequest = {
    id: 'T8',
    name: 'Horaire hors tolérance',
    pickupLat: 31.6425,
    pickupLng: -8.0418,
    pickupLabel: 'Targa',
    dropoffLat: 31.6295,
    dropoffLng: -7.9811,
    dropoffLabel: 'Médina',
    date: "Aujourd'hui",
    departureTime: '08:35', // +35 min
    seats: 1,
  };
  const res8 = matchPassenger(t8Passenger, trip);
  results.push({
    id: 8,
    name: 'Horaire hors tolérance',
    category: 'MATCHING',
    expected: 'REJECT (TIME)',
    actual: res8.compatible ? 'MATCH' : `REJECT (${res8.reason})`,
    passed: res8.compatible === false && res8.reason === 'TIME',
    details: `Différence horaire 35 min > max 15 min : rejeté (${res8.reason})`,
  });

  // Test 9: Trajet complet (0 places disponibles) => REJECT (NO_SEATS)
  const fullTrip: CanonicalTrip = {
    ...trip,
    totalSeats: 4,
    reservedSeatUnits: 4, // 0 place libre
  };
  const res9 = matchPassenger(t1Passenger, fullTrip);
  results.push({
    id: 9,
    name: 'Trajet complet',
    category: 'MATCHING',
    expected: 'REJECT (NO_SEATS)',
    actual: res9.compatible ? 'MATCH' : `REJECT (${res9.reason})`,
    passed: res9.compatible === false && res9.reason === 'NO_SEATS',
    details: `Places disponibles = 0 : rejeté (${res9.reason})`,
  });

  // Test 10: Deux passagers même segment (Section 26) => 45 / 2 = 22.50 DH chacun
  const twoPassengersSameRoute: BookingSegmentUser[] = [
    { passengerId: 'P1', passengerName: 'P1', seatUnits: 1, pickupPositionKm: 0.0, dropoffPositionKm: 12.4 },
    { passengerId: 'P2', passengerName: 'P2', seatUnits: 1, pickupPositionKm: 0.0, dropoffPositionKm: 12.4 },
  ];
  const pricing10 = calculatePricing(trip.id, 45.0, 12.4, twoPassengersSameRoute);
  const p1_p = pricing10.passengers.find((p) => p.passengerId === 'P1')?.price;
  const p2_p = pricing10.passengers.find((p) => p.passengerId === 'P2')?.price;
  const test10Passed = p1_p === 22.5 && p2_p === 22.5 && pricing10.conservationValid;
  results.push({
    id: 10,
    name: 'Deux passagers même segment',
    category: 'PRICING',
    expected: 'P1=22.50 DH, P2=22.50 DH (Total 45.00 DH)',
    actual: `P1=${p1_p?.toFixed(2)} DH, P2=${p2_p?.toFixed(2)} DH (Total ${pricing10.totalAllocated.toFixed(2)} DH)`,
    passed: test10Passed,
    details: `Partage 50/50 exact sur 12.4km : conservation=${pricing10.conservationValid}`,
  });

  // Test 11: Trois passagers chevauchants (Section 23 & 24) => P1=8.71 DH, P2=22.50 DH, P3=13.79 DH
  const threeOverlapping: BookingSegmentUser[] = [
    { passengerId: 'P1', passengerName: 'P1 (0→4.8)', seatUnits: 1, pickupPositionKm: 0.0, dropoffPositionKm: 4.8 },
    { passengerId: 'P2', passengerName: 'P2 (0→12.4)', seatUnits: 1, pickupPositionKm: 0.0, dropoffPositionKm: 12.4 },
    { passengerId: 'P3', passengerName: 'P3 (4.8→12.4)', seatUnits: 1, pickupPositionKm: 4.8, dropoffPositionKm: 12.4 },
  ];
  const pricing11 = calculatePricing(trip.id, 45.0, 12.4, threeOverlapping);
  const p1_11 = pricing11.passengers.find((p) => p.passengerId === 'P1')?.price;
  const p2_11 = pricing11.passengers.find((p) => p.passengerId === 'P2')?.price;
  const p3_11 = pricing11.passengers.find((p) => p.passengerId === 'P3')?.price;
  const test11Passed =
    p1_11 !== undefined &&
    p2_11 !== undefined &&
    p3_11 !== undefined &&
    Math.abs(p1_11 - 8.71) <= 0.05 &&
    Math.abs(p2_11 - 22.5) <= 0.05 &&
    Math.abs(p3_11 - 13.79) <= 0.05 &&
    pricing11.conservationValid;

  results.push({
    id: 11,
    name: 'Trois passagers chevauchants',
    category: 'PRICING',
    expected: 'P1=8.71 DH, P2=22.50 DH, P3=13.79 DH (Total 45.00 DH)',
    actual: `P1=${p1_11?.toFixed(2)} DH, P2=${p2_11?.toFixed(2)} DH, P3=${p3_11?.toFixed(2)} DH (Total ${pricing11.totalAllocated.toFixed(2)} DH)`,
    passed: test11Passed,
    details: `Découpage S1 (17.42 DH), S2 (11.98 DH), S3 (15.60 DH) conforme aux sections 21-24`,
  });

  // Test 12: Blocage de places (Section 27) => P1 (1 place) = 1/4 du prix, P2 (3 places bloquées) = 3/4 du prix
  const blockingTest: BookingSegmentUser[] = [
    { passengerId: 'P1', passengerName: 'P1 (1 place)', seatUnits: 1, pickupPositionKm: 0.0, dropoffPositionKm: 12.4 },
    { passengerId: 'P2', passengerName: 'P2 (3 places bloquées)', seatUnits: 3, pickupPositionKm: 0.0, dropoffPositionKm: 12.4 },
  ];
  const pricing12 = calculatePricing(trip.id, 45.0, 12.4, blockingTest);
  const p1_12 = pricing12.passengers.find((p) => p.passengerId === 'P1')?.price;
  const p2_12 = pricing12.passengers.find((p) => p.passengerId === 'P2')?.price;
  const test12Passed =
    p1_12 !== undefined &&
    p2_12 !== undefined &&
    Math.abs(p1_12 - 11.25) <= 0.05 &&
    Math.abs(p2_12 - 33.75) <= 0.05 &&
    pricing12.conservationValid;

  results.push({
    id: 12,
    name: 'Blocage de places (Seat units)',
    category: 'PRICING',
    expected: 'P1 (1 siège) = 11.25 DH, P2 (3 sièges) = 33.75 DH',
    actual: `P1=${p1_12?.toFixed(2)} DH, P2=${p2_12?.toFixed(2)} DH (Total ${pricing12.totalAllocated.toFixed(2)} DH)`,
    passed: test12Passed,
    details: `P1 paie 1/4 (25%) et P2 paie 3/4 (75%) sur chaque segment`,
  });

  const totalPassed = results.filter((r) => r.passed).length;

  return {
    results,
    totalPassed,
    totalTests: results.length,
  };
}
