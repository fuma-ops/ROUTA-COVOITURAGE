import { Trip, CorridorStop } from '../types';

/**
 * Normalise une chaîne pour la recherche : minuscules, suppression des accents et caractères spéciaux
 */
export function normalizeText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // supprime les accents (é -> e, è -> e, etc.)
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Principaux corridors autoroutiers et axes nationaux du Maroc avec ordre linéaire
 */
const MOROCCAN_CORRIDORS: { name: string; cities: string[] }[] = [
  // Axe Atlantique Nord-Sud : Agadir -> Tanger
  {
    name: 'Axe Atlantique A3 / A7 / A1',
    cities: [
      'agadir',
      'chichaoua',
      'marrakech',
      'benguerir',
      'settat',
      'berrechid',
      'casablanca',
      'mohammedia',
      'bouznika',
      'skhirat',
      'rabat',
      'sale',
      'kenitra',
      'larache',
      'asilah',
      'tanger',
    ],
  },
  // Axe Est-Ouest : Oujda -> Rabat
  {
    name: 'Axe Est-Ouest A2',
    cities: [
      'oujda',
      'berkane',
      'taourirt',
      'guercif',
      'taza',
      'fes',
      'meknes',
      'khemisset',
      'tiflet',
      'rabat',
    ],
  },
  // Axe Sud : Marrakech -> Ouarzazate / Zagora
  {
    name: 'Axe Sud N9',
    cities: ['marrakech', 'ait ourir', 'taddert', 'tizi n tichka', 'ouarzazate', 'zagora'],
  },
  // Axe Marrakech Métropole (Quartiers & Périphérie)
  {
    name: 'Marrakech Intra-Urbain',
    cities: [
      'targa',
      'massira',
      'menara',
      'hivernage',
      'gueliz',
      'daoudiate',
      'medina',
      'sidi youssef',
      'agdal',
      'palmeraie',
    ],
  },
  // Axe Casablanca Métropole
  {
    name: 'Casablanca Intra-Urbain',
    cities: [
      'maarif',
      'gauthier',
      'bourgogne',
      'oasis',
      'casa voyageurs',
      'casa port',
      'sidi maarouf',
      'technopark',
      'californie',
      'ain sebaa',
      'mohammedia',
    ],
  },
  // Axe Rabat-Salé Métropole
  {
    name: 'Rabat-Salé Intra-Urbain',
    cities: ['hay riad', 'agdal', 'souissi', 'hassan', 'rabat ville', 'sale', 'tabriquet'],
  },
];

export interface TripMatchEvaluation {
  trip: Trip;
  isMatch: boolean;
  matchType: 'exact' | 'compatible' | 'nearby' | 'alternative';
  score: number; // 0-100
  matchLabel: string;
  pickupPoint: string;
  dropoffPoint: string;
  calculatedPrice: number;
  isSegment: boolean;
  segmentDistanceKm: number;
}

/**
 * Extrait les étapes clés d'un trajet (origine, arrêts intermédiaires, destination)
 */
function getTripRoutePoints(trip: Trip): { name: string; norm: string; order: number }[] {
  const points: { name: string; norm: string; order: number }[] = [];
  
  // Point de départ
  points.push({ name: trip.origin, norm: normalizeText(trip.origin), order: 0 });
  
  // Arrêts du corridor
  if (trip.corridor && trip.corridor.length > 0) {
    trip.corridor.forEach((stop, idx) => {
      points.push({ name: stop.name, norm: normalizeText(stop.name), order: idx + 1 });
    });
  }
  
  // Point d'arrivée
  points.push({
    name: trip.destination,
    norm: normalizeText(trip.destination),
    order: (trip.corridor?.length || 0) + 1,
  });

  return points;
}

/**
 * Recherche si deux villes/quartiers appartiennent au même corridor national et sont dans le bon ordre
 */
function checkCorridorSequence(originNorm: string, destNorm: string): { found: boolean; ratio: number } {
  for (const corridor of MOROCCAN_CORRIDORS) {
    const originIdx = corridor.cities.findIndex((c) => originNorm.includes(c) || c.includes(originNorm));
    const destIdx = corridor.cities.findIndex((c) => destNorm.includes(c) || c.includes(destNorm));

    if (originIdx !== -1 && destIdx !== -1 && originIdx < destIdx) {
      const segmentSteps = destIdx - originIdx;
      const totalSteps = corridor.cities.length;
      return { found: true, ratio: Math.max(0.3, segmentSteps / totalSteps) };
    }
  }
  return { found: false, ratio: 1.0 };
}

/**
 * Évalue la compatibilité d'un trajet quelconque avec une recherche passager
 * Fonctionne avec N'IMPORTE QUEL trajet (créé manuellement, publié par un conducteur, etc.)
 */
export function evaluateTripMatch(
  trip: Trip,
  searchOrigin: string,
  searchDestination: string,
  searchDate?: string,
  searchTime?: string
): TripMatchEvaluation {
  const normSearchOrigin = normalizeText(searchOrigin);
  const normSearchDest = normalizeText(searchDestination);
  const normTripOrigin = normalizeText(trip.origin);
  const normTripDest = normalizeText(trip.destination);

  // Si la recherche est vide, on retourne tous les trajets
  if (!normSearchOrigin && !normSearchDest) {
    return {
      trip,
      isMatch: true,
      matchType: trip.match_type || 'exact',
      score: 100,
      matchLabel: 'Trajet disponible',
      pickupPoint: trip.origin,
      dropoffPoint: trip.destination,
      calculatedPrice: trip.passenger_contribution,
      isSegment: false,
      segmentDistanceKm: trip.distance_km,
    };
  }

  // 1. VÉRIFICATION CORRESPONDANCE EXACTE (Origine + Destination)
  const isOriginExact =
    normSearchOrigin &&
    (normTripOrigin.includes(normSearchOrigin) ||
      normSearchOrigin.includes(normTripOrigin) ||
      normalizeText(trip.origin).includes(normSearchOrigin));

  const isDestExact =
    normSearchDest &&
    (normTripDest.includes(normSearchDest) ||
      normSearchDest.includes(normTripDest) ||
      normalizeText(trip.destination).includes(normSearchDest));

  if (isOriginExact && isDestExact) {
    return {
      trip,
      isMatch: true,
      matchType: 'exact',
      score: 98,
      matchLabel: 'Correspondance exacte',
      pickupPoint: trip.origin,
      dropoffPoint: trip.destination,
      calculatedPrice: trip.passenger_contribution,
      isSegment: false,
      segmentDistanceKm: trip.distance_km,
    };
  }

  // 2. VÉRIFICATION CORRIDOR / ARRÊTS INTERMÉDIAIRES DU TRAJET
  const tripPoints = getTripRoutePoints(trip);
  let matchedPickup: { name: string; order: number } | null = null;
  let matchedDropoff: { name: string; order: number } | null = null;

  for (const pt of tripPoints) {
    if (normSearchOrigin && (pt.norm.includes(normSearchOrigin) || normSearchOrigin.includes(pt.norm))) {
      if (!matchedPickup || pt.order < matchedPickup.order) {
        matchedPickup = { name: pt.name, order: pt.order };
      }
    }
    if (normSearchDest && (pt.norm.includes(normSearchDest) || normSearchDest.includes(pt.norm))) {
      if (!matchedDropoff || pt.order > matchedDropoff.order) {
        matchedDropoff = { name: pt.name, order: pt.order };
      }
    }
  }

  if (matchedPickup && matchedDropoff && matchedPickup.order < matchedDropoff.order) {
    const isFullTrip =
      matchedPickup.order === 0 && matchedDropoff.order === tripPoints.length - 1;
    const isSegment = !isFullTrip;
    const segmentRatio = (matchedDropoff.order - matchedPickup.order) / (tripPoints.length - 1);
    const calculatedPrice = isSegment
      ? Math.max(10, Math.round(trip.passenger_contribution * Math.max(0.4, segmentRatio)))
      : trip.passenger_contribution;

    return {
      trip,
      isMatch: true,
      matchType: isSegment ? 'compatible' : 'exact',
      score: isSegment ? 90 : 96,
      matchLabel: isSegment ? `Sur l'itinéraire (${matchedPickup.name} → ${matchedDropoff.name})` : 'Correspondance exacte',
      pickupPoint: matchedPickup.name,
      dropoffPoint: matchedDropoff.name,
      calculatedPrice,
      isSegment,
      segmentDistanceKm: Math.round(trip.distance_km * (isSegment ? segmentRatio : 1.0)),
    };
  }

  // 3. VÉRIFICATION GRAND CORRIDOR NATIONAL (ex: trajet Marrakech -> Casablanca, passager cherche Benguerir -> Settat)
  const corridorCheck = checkCorridorSequence(
    normSearchOrigin || normTripOrigin,
    normSearchDest || normTripDest
  );

  const tripCorridorCheck = checkCorridorSequence(normTripOrigin, normTripDest);

  if (corridorCheck.found && tripCorridorCheck.found) {
    // Vérifier si la recherche du passager s'inscrit dans le trajet du conducteur
    const calculatedPrice = Math.max(
      10,
      Math.round(trip.passenger_contribution * Math.min(1.0, Math.max(0.35, corridorCheck.ratio)))
    );

    return {
      trip,
      isMatch: true,
      matchType: 'compatible',
      score: 82,
      matchLabel: `Itinéraire compatible (${searchOrigin || trip.origin} → ${searchDestination || trip.destination})`,
      pickupPoint: searchOrigin || trip.origin,
      dropoffPoint: searchDestination || trip.destination,
      calculatedPrice,
      isSegment: true,
      segmentDistanceKm: Math.round(trip.distance_km * corridorCheck.ratio),
    };
  }

  // 4. CORRESPONDANCE PARTIELLE (même point de départ OU même point d'arrivée)
  if (isOriginExact && !normSearchDest) {
    return {
      trip,
      isMatch: true,
      matchType: 'compatible',
      score: 75,
      matchLabel: `Départ identique (${trip.origin})`,
      pickupPoint: trip.origin,
      dropoffPoint: trip.destination,
      calculatedPrice: trip.passenger_contribution,
      isSegment: false,
      segmentDistanceKm: trip.distance_km,
    };
  }

  if (isDestExact && !normSearchOrigin) {
    return {
      trip,
      isMatch: true,
      matchType: 'compatible',
      score: 75,
      matchLabel: `Arrivée identique (${trip.destination})`,
      pickupPoint: trip.origin,
      dropoffPoint: trip.destination,
      calculatedPrice: trip.passenger_contribution,
      isSegment: false,
      segmentDistanceKm: trip.distance_km,
    };
  }

  // 5. Recherche large / générale : si l'un des termes apparaît dans la description ou les arrêts
  const containsOrigin = normSearchOrigin && (
    normTripOrigin.includes(normSearchOrigin) ||
    normTripDest.includes(normSearchOrigin) ||
    trip.corridor?.some((c) => normalizeText(c.name).includes(normSearchOrigin))
  );

  const containsDest = normSearchDest && (
    normTripOrigin.includes(normSearchDest) ||
    normTripDest.includes(normSearchDest) ||
    trip.corridor?.some((c) => normalizeText(c.name).includes(normSearchDest))
  );

  if (containsOrigin || containsDest) {
    return {
      trip,
      isMatch: true,
      matchType: 'nearby',
      score: 65,
      matchLabel: 'Trajet alternatif proche',
      pickupPoint: trip.origin,
      dropoffPoint: trip.destination,
      calculatedPrice: trip.passenger_contribution,
      isSegment: false,
      segmentDistanceKm: trip.distance_km,
    };
  }

  // Si aucun critère ne correspond et qu'une recherche précise était demandée
  return {
    trip,
    isMatch: false,
    matchType: 'alternative',
    score: 30,
    matchLabel: 'Autre trajet',
    pickupPoint: trip.origin,
    dropoffPoint: trip.destination,
    calculatedPrice: trip.passenger_contribution,
    isSegment: false,
    segmentDistanceKm: trip.distance_km,
  };
}
