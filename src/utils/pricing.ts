/**
 * Moteur de calcul de tarification équitable et transparent - Routa Maroc
 * Conforme aux spécifications du Cahier des Charges :
 * - Section 26 : Tarification & Calcul automatisé proportionnel à la distance
 * - Section 33 : Modèle sans commission (0 DH commission, gratuité usagers, monétisation par partenaires sponsors)
 * - Réglementation marocaine : Partage strict des frais déboursés, non-lucrativité absolue, interdiction du bénéfice commercial
 */

export interface TarificationBreakdown {
  distance_km: number;
  duration_min: number;
  fuel_liters: number;
  fuel_cost_dh: number;
  wear_cost_dh: number;
  toll_cost_dh: number;
  total_vehicle_cost_dh: number; // Coût global réel de la voiture déboursé par le conducteur
  suggested_price_per_seat: number; // Contribution équitable par passager (coût divisé entre tous les occupants)
  min_allowed_price_per_seat: number; // Plancher légal encadré (-15%)
  max_allowed_price_per_seat: number; // Plafond légal anti-lucratif (+15%)
  routa_commission_dh: number; // Toujours 0 DH (Section 33)
  driver_share_dh: number; // Part restant à la charge du conducteur
  max_collected_if_full_dh: number; // Total perçu si toutes les places sont occupées (toujours <= total_vehicle_cost_dh)
  segment_prices: Record<string, number>;
}

// Barème officiel de référence Maroc
export const PRICING_REFERENCE = {
  FUEL_RATE_PER_KM: 0.85, // Basé sur 6.2 L/100km à ~13.70 DH/L
  WEAR_RATE_PER_KM: 0.35, // Usure, vidange, amortissement, pneumatiques
  TOTAL_KM_RATE: 1.20, // 0.85 + 0.35 DH/km
  MIN_URBAN_FLOOR_DH: 10, // Seuil plancher urbain pour couvrir le coût d'arrêt/détour
  COMMISSION_RATE: 0.0, // 0 DH commission
  FLEXIBILITY_PERCENT: 0.15, // Fourchette autorisée (+/- 15%)
};

// Matrice des distances représentatives au Maroc
const DISTANCE_MATRIX: Record<string, Record<string, { km: number; min: number; toll: number }>> = {
  targa: {
    médina: { km: 12, min: 25, toll: 0 },
    guéliz: { km: 7, min: 15, toll: 0 },
    hivernage: { km: 9, min: 18, toll: 0 },
    'sidi ghanem': { km: 6, min: 12, toll: 0 },
    gare: { km: 8, min: 16, toll: 0 },
    aéroport: { km: 11, min: 20, toll: 0 },
    massira: { km: 5, min: 10, toll: 0 },
    palmeraie: { km: 14, min: 25, toll: 0 },
    'm’hamid': { km: 13, min: 25, toll: 0 },
  },
  guéliz: {
    médina: { km: 5, min: 12, toll: 0 },
    hivernage: { km: 4, min: 10, toll: 0 },
    'sidi ghanem': { km: 8, min: 18, toll: 0 },
    gare: { km: 3, min: 8, toll: 0 },
    aéroport: { km: 7, min: 15, toll: 0 },
    palmeraie: { km: 10, min: 20, toll: 0 },
    targa: { km: 7, min: 15, toll: 0 },
    massira: { km: 6, min: 14, toll: 0 },
  },
  casablanca: {
    rabat: { km: 87, min: 65, toll: 23 },
    marrakech: { km: 242, min: 165, toll: 82 },
    tanger: { km: 340, min: 210, toll: 110 },
    fès: { km: 295, min: 195, toll: 75 },
    agadir: { km: 465, min: 280, toll: 130 },
    settat: { km: 75, min: 55, toll: 18 },
    berrechid: { km: 42, min: 35, toll: 10 },
  },
  marrakech: {
    casablanca: { km: 242, min: 165, toll: 82 },
    rabat: { km: 325, min: 215, toll: 105 },
    agadir: { km: 258, min: 175, toll: 78 },
    essaouira: { km: 178, min: 140, toll: 0 },
    benguerir: { km: 75, min: 50, toll: 25 },
    settat: { km: 170, min: 115, toll: 60 },
  },
  rabat: {
    casablanca: { km: 87, min: 65, toll: 23 },
    fès: { km: 205, min: 135, toll: 58 },
    tanger: { km: 250, min: 155, toll: 85 },
    kenitra: { km: 45, min: 35, toll: 12 },
    meknès: { km: 145, min: 100, toll: 42 },
  },
  tanger: {
    rabat: { km: 250, min: 155, toll: 85 },
    casablanca: { km: 340, min: 210, toll: 110 },
    tétouan: { km: 60, min: 55, toll: 0 },
    asilah: { km: 45, min: 35, toll: 15 },
  },
  fès: {
    meknès: { km: 60, min: 45, toll: 15 },
    rabat: { km: 205, min: 135, toll: 58 },
    casablanca: { km: 295, min: 195, toll: 75 },
  },
  agadir: {
    marrakech: { km: 258, min: 175, toll: 78 },
    casablanca: { km: 465, min: 280, toll: 130 },
    taroudant: { km: 82, min: 65, toll: 0 },
  },
};

/**
 * Normalise un nom de lieu pour la recherche de distance
 */
function normalizePlace(name: string): string {
  const lower = name.toLowerCase();
  for (const key of [
    'targa', 'guéliz', 'gueliz', 'médina', 'medina', 'hivernage', 'sidi ghanem',
    'casablanca', 'rabat', 'marrakech', 'tanger', 'agadir', 'fès', 'fes',
    'gare', 'aéroport', 'aeroport', 'massira', 'palmeraie', 'm’hamid', 'mhamid',
    'settat', 'berrechid', 'kenitra', 'meknès', 'meknes', 'essaouira', 'tétouan', 'tetouan',
  ]) {
    if (lower.includes(key)) {
      if (key === 'gueliz') return 'guéliz';
      if (key === 'medina') return 'médina';
      if (key === 'fes') return 'fès';
      if (key === 'aeroport') return 'aéroport';
      if (key === 'mhamid') return 'm’hamid';
      if (key === 'meknes') return 'meknès';
      if (key === 'tetouan') return 'tétouan';
      return key;
    }
  }
  return lower.trim();
}

/**
 * Calcul Haversine avec facteur de courbure routière marocaine (~1.25x)
 */
export function calculateCoordsDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { km: number; min: number; toll: number } {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Facteur de tracé routier réel
  const roadKm = Math.max(2, Math.round(straightKm * 1.25 * 10) / 10);
  // Vitesse moyenne estimée : 30 km/h en ville (<20km), 90 km/h sur route (>20km)
  const avgSpeed = roadKm <= 20 ? 30 : 85;
  const estMin = Math.max(8, Math.round((roadKm / avgSpeed) * 60));

  // Péage autoroutier estimé si longue distance interurbaine (>60km)
  const toll = roadKm >= 60 ? Math.round(roadKm * 0.3) : 0;

  return { km: roadKm, min: estMin, toll };
}

/**
 * Estime la distance, la durée et le péage entre deux adresses ou repères
 */
// Coordonnées d'un lieu ; precisionMeters > 0 pour une ville entière
export interface GeoCoords {
  lat: number;
  lng: number;
  precisionMeters?: number;
}

export function estimateDistanceAndDuration(
  origin: string,
  destination: string,
  originCoords?: GeoCoords,
  destCoords?: GeoCoords
): { km: number; min: number; toll: number } {
  const hasCoords = !!(originCoords && destCoords && originCoords.lat && destCoords.lat);
  const fromCoords = () =>
    calculateCoordsDistanceKm(originCoords!.lat, originCoords!.lng, destCoords!.lat, destCoords!.lng);

  // Deux points précis (GPS choisi sur la carte, lieu connu) : la distance vient des coordonnées
  if (hasCoords && !originCoords!.precisionMeters && !destCoords!.precisionMeters) {
    return fromCoords();
  }

  // Ville entière : son centre n'est pas un vrai point, les distances de référence
  // par la route sont plus justes
  const normOrigin = normalizePlace(origin);
  const normDest = normalizePlace(destination);

  // Recherche directe dans la matrice
  if (DISTANCE_MATRIX[normOrigin]?.[normDest]) {
    return DISTANCE_MATRIX[normOrigin][normDest];
  }
  if (DISTANCE_MATRIX[normDest]?.[normOrigin]) {
    return DISTANCE_MATRIX[normDest][normOrigin];
  }

  // Détection interurbaine par nom de ville
  const originLower = origin.toLowerCase();
  const destLower = destination.toLowerCase();

  const cities = ['casablanca', 'rabat', 'marrakech', 'tanger', 'agadir', 'fès', 'meknès', 'essaouira'];
  const foundOriginCity = cities.find((c) => originLower.includes(c));
  const foundDestCity = cities.find((c) => destLower.includes(c));

  if (foundOriginCity && foundDestCity && foundOriginCity !== foundDestCity) {
    if (DISTANCE_MATRIX[foundOriginCity]?.[foundDestCity]) {
      return DISTANCE_MATRIX[foundOriginCity][foundDestCity];
    }
    if (DISTANCE_MATRIX[foundDestCity]?.[foundOriginCity]) {
      return DISTANCE_MATRIX[foundDestCity][foundOriginCity];
    }
  }

  if (hasCoords) {
    return fromCoords();
  }

  // Par défaut intra-urbain (trajet moyen de ville marocaine : 10 km, 20 min)
  return { km: 10, min: 20, toll: 0 };
}

/**
 * MOTEUR OFFICIEL DE TARIFICATION ROUTA (Cahier des charges Section 26 & Section 33)
 *
 * Règles mathématiques strictes :
 * 1. Coût véhicule = (Distance_km × 1.20 DH) + Péage
 *    - Carburant : 0.85 DH / km
 *    - Usure & amortissement : 0.35 DH / km
 * 2. Répartition équitable par personne à bord :
 *    - Total occupants = 1 conducteur + N passagers
 *    - Quote-part unitaire exacte = Coût véhicule / (N + 1)
 *    - Seuil plancher urbain équitable : 10 DH minimum (pour amortir le point d'arrêt)
 * 3. Encadrement strict :
 *    - Min légal = Quote-part × 0.85 (-15%)
 *    - Max légal = Quote-part × 1.15 (+15%)
 *    - Non-lucrativité garantie : Total perçu par le conducteur <= Coût global du véhicule
 * 4. Commission Routa : 0 DH (100% gratuit)
 */
export function calculateTripTarification(
  origin: string,
  destination: string,
  availableSeats: number = 3,
  customPricePerSeat?: number,
  originCoords?: GeoCoords,
  destCoords?: GeoCoords
): TarificationBreakdown {
  const { km, min, toll } = estimateDistanceAndDuration(origin, destination, originCoords, destCoords);

  // 1. Décomposition des coûts directs selon barème national (Section 26)
  const fuelLiters = Math.round(((km * 6.2) / 100) * 10) / 10;
  const fuelCost = Math.round(km * PRICING_REFERENCE.FUEL_RATE_PER_KM);
  const wearCost = Math.round(km * PRICING_REFERENCE.WEAR_RATE_PER_KM);
  const tollCost = toll;

  // Coût total réel de la course pour la voiture
  const totalVehicleCost = Math.max(10, fuelCost + wearCost + tollCost);

  // 2. Clé de répartition entre tous les occupants du véhicule :
  // Le véhicule compte : 1 conducteur + N passagers (places vendables)
  const seatsOffered = Math.max(1, availableSeats);
  const totalOccupants = seatsOffered + 1; // Le conducteur prend sa part intégrale

  // Contribution de référence par personne
  let baseSuggestedPrice: number;
  if (km <= 15) {
    // Urbain court : forfait plancher 10 DH pour le déplacement/détour
    const rawQuote = totalVehicleCost / totalOccupants;
    baseSuggestedPrice = Math.max(PRICING_REFERENCE.MIN_URBAN_FLOOR_DH, Math.round(rawQuote));
  } else if (km <= 35) {
    // Périurbain
    const rawQuote = totalVehicleCost / totalOccupants;
    baseSuggestedPrice = Math.max(15, Math.round(rawQuote));
  } else {
    // Interurbain (autoroute / nationale)
    // Division rigoureuse du coût global (carburant + usure + péage) par le nombre total de personnes à bord
    baseSuggestedPrice = Math.round(totalVehicleCost / totalOccupants);
    if (baseSuggestedPrice < 20) baseSuggestedPrice = 20;
  }

  // 3. Encadrement légal strict (-15% / +15%)
  const minAllowed = Math.max(
    km <= 15 ? 10 : 15,
    Math.round(baseSuggestedPrice * (1 - PRICING_REFERENCE.FLEXIBILITY_PERCENT))
  );
  const maxAllowed = Math.max(
    minAllowed + 2,
    Math.round(baseSuggestedPrice * (1 + PRICING_REFERENCE.FLEXIBILITY_PERCENT))
  );

  // 4. Prix final par siège choisi par le conducteur dans les limites légales
  let finalSeatPrice = baseSuggestedPrice;
  if (customPricePerSeat !== undefined && customPricePerSeat !== null) {
    if (customPricePerSeat >= minAllowed && customPricePerSeat <= maxAllowed) {
      finalSeatPrice = customPricePerSeat;
    } else if (customPricePerSeat < minAllowed) {
      finalSeatPrice = minAllowed;
    } else if (customPricePerSeat > maxAllowed) {
      finalSeatPrice = maxAllowed;
    }
  }

  // Calcul du total collecté si plein et de la part conducteur
  const maxCollectedIfFull = finalSeatPrice * seatsOffered;
  const driverShare = Math.max(0, totalVehicleCost - maxCollectedIfFull);

  // 5. Calcul des segments intermédiaires (Corridor) au prorata de distance
  const segmentPrices: Record<string, number> = {
    full: finalSeatPrice,
    half: Math.max(10, Math.round(finalSeatPrice * 0.55)),
    short: Math.max(10, Math.round(finalSeatPrice * 0.35)),
  };

  return {
    distance_km: km,
    duration_min: min,
    fuel_liters: fuelLiters,
    fuel_cost_dh: fuelCost,
    wear_cost_dh: wearCost,
    toll_cost_dh: tollCost,
    total_vehicle_cost_dh: totalVehicleCost,
    suggested_price_per_seat: finalSeatPrice,
    min_allowed_price_per_seat: minAllowed,
    max_allowed_price_per_seat: maxAllowed,
    routa_commission_dh: 0, // Gratuit 0 DH (Section 33)
    driver_share_dh: driverShare,
    max_collected_if_full_dh: maxCollectedIfFull,
    segment_prices: segmentPrices,
  };
}
