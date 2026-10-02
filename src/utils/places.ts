/**
 * Référentiel de lieux (géocodage V1)
 * Le moteur de matching travaille sur des coordonnées GPS (Spécification §7-9) :
 * ce module transforme un libellé saisi par l'utilisateur en point géographique.
 *
 * - Points précis (quartiers, gares, arrêts de corridor) : precisionMeters = 0
 * - Villes entières : precisionMeters = rayon approximatif de l'agglomération.
 *   Un nom de ville ne désigne pas un point exact ; le point précis est confirmé
 *   ensuite dans le chat (Cahier des charges §28).
 */

export interface Place {
  name: string;
  lat: number;
  lng: number;
  precisionMeters: number;
}

export interface NamedPoint {
  name: string;
  lat: number;
  lng: number;
}

// Points populaires proposés dans le sélecteur de carte
export const MOROCCAN_PRESETS: NamedPoint[] = [
  { name: 'Targa (Carrefour), Marrakech', lat: 31.6425, lng: -8.0418 },
  { name: 'Guéliz (Plaza), Marrakech', lat: 31.6346, lng: -8.0125 },
  { name: 'Médina (Bab Doukkala), Marrakech', lat: 31.6295, lng: -7.9811 },
  { name: 'Hivernage (Av. Mohammed VI), Marrakech', lat: 31.6241, lng: -8.0054 },
  { name: 'Gare ONCF Marrakech', lat: 31.6305, lng: -8.0185 },
  { name: 'Sidi Ghanem, Marrakech', lat: 31.6675, lng: -8.0284 },
  { name: 'Aéroport Marrakech Ménara', lat: 31.6069, lng: -8.0363 },
  { name: 'M’hamid, Marrakech', lat: 31.5978, lng: -8.0389 },
  { name: 'Massira, Marrakech', lat: 31.6267, lng: -8.0583 },
  { name: 'Casablanca (Casa Port)', lat: 33.5992, lng: -7.6114 },
  { name: 'Rabat (Agdal)', lat: 33.9985, lng: -6.852 },
];

// Villes : centre approximatif + rayon de l'agglomération
const MOROCCAN_CITIES: Place[] = [
  { name: 'Marrakech', lat: 31.6295, lng: -7.9811, precisionMeters: 8000 },
  { name: 'Casablanca', lat: 33.5731, lng: -7.5898, precisionMeters: 12000 },
  { name: 'Rabat', lat: 34.0209, lng: -6.8416, precisionMeters: 8000 },
  { name: 'Salé', lat: 34.0531, lng: -6.7985, precisionMeters: 6000 },
  { name: 'Tanger', lat: 35.7595, lng: -5.834, precisionMeters: 8000 },
  { name: 'Fès', lat: 34.0181, lng: -5.0078, precisionMeters: 8000 },
  { name: 'Meknès', lat: 33.8935, lng: -5.5473, precisionMeters: 7000 },
  { name: 'Agadir', lat: 30.4278, lng: -9.5981, precisionMeters: 8000 },
  { name: 'Essaouira', lat: 31.5085, lng: -9.7595, precisionMeters: 4000 },
  { name: 'Kénitra', lat: 34.261, lng: -6.5802, precisionMeters: 6000 },
  { name: 'Tétouan', lat: 35.5785, lng: -5.3684, precisionMeters: 6000 },
  { name: 'Oujda', lat: 34.6814, lng: -1.9086, precisionMeters: 7000 },
  { name: 'Settat', lat: 33.001, lng: -7.616, precisionMeters: 5000 },
  { name: 'Berrechid', lat: 33.2655, lng: -7.5875, precisionMeters: 4000 },
  { name: 'Ben Guerir', lat: 32.234, lng: -7.954, precisionMeters: 4000 },
  { name: 'Mohammedia', lat: 33.6866, lng: -7.3829, precisionMeters: 5000 },
  { name: 'El Jadida', lat: 33.2316, lng: -8.5007, precisionMeters: 5000 },
  { name: 'Ouarzazate', lat: 30.9335, lng: -6.937, precisionMeters: 5000 },
];

export function normalizePlaceName(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Partie principale d'un libellé : "Targa (Carrefour), Marrakech" → "targa" */
function primaryKey(name: string): string {
  return normalizePlaceName(name.split(/[,(]/)[0]);
}

/* ------------------------------------------------------------------ */
/* Libellés porteurs de coordonnées                                     */
/* Un point choisi sur la carte garde ses coordonnées exactes dans son  */
/* libellé : elles suivent le lieu dans la recherche, la réservation,   */
/* la publication et le stockage, sans perte ni approximation.          */
/* ------------------------------------------------------------------ */

const GPS_LABEL_REGEX = /GPS\s*\(?\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)?/i;

// En deçà de cette distance, un point cliqué porte le nom du lieu connu
// (ses coordonnées restent celles du clic)
const SAME_PLACE_METERS = 100;
// Rayon dans lequel on indique « Près de … » pour rendre le libellé lisible
const NEARBY_LABEL_METERS = 2000;

function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "… GPS 31.6425, -8.0418" ou "Point GPS (31.6425, -8.0418)" → coordonnées exactes */
function parseGpsLabel(name: string): Place | null {
  const m = name.match(GPS_LABEL_REGEX);
  if (!m) return null;
  return { name, lat: parseFloat(m[1]), lng: parseFloat(m[2]), precisionMeters: 0 };
}

/**
 * Libellé d'un point cliqué sur la carte. Il embarque toujours les coordonnées
 * exactes du clic ; le nom du lieu connu voisin ne sert qu'à la lisibilité.
 */
export function labelForPoint(lat: number, lng: number): string {
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  let nearest: NamedPoint | null = null;
  let nearestMeters = Infinity;
  for (const p of MOROCCAN_PRESETS) {
    const d = distanceMeters(p, { lat, lng });
    if (d < nearestMeters) {
      nearest = p;
      nearestMeters = d;
    }
  }
  const prefix = !nearest
    ? 'Point sur la carte'
    : nearestMeters <= SAME_PLACE_METERS
      ? nearest.name.split(',')[0]
      : nearestMeters <= NEARBY_LABEL_METERS
        ? `Près de ${nearest.name.split(',')[0]}`
        : 'Point sur la carte';
  return `${prefix} · GPS ${roundedLat}, ${roundedLng}`;
}

/** Libellé lisible, sans les coordonnées : "Près de Guéliz (Plaza)" */
export function displayPlaceName(label: string): string {
  const cleaned = label
    .replace(/\s*·\s*GPS.*$/i, '')
    .replace(GPS_LABEL_REGEX, '')
    .trim();
  return cleaned || 'Point sur la carte';
}

/** Vrai si le libellé désigne un point précis (pas une ville entière) */
export function isPrecisePlace(label: string): boolean {
  const place = resolvePlace(label);
  return !!place && place.precisionMeters === 0;
}

/**
 * Résout un libellé en coordonnées.
 * Ordre de priorité : point GPS explicite → points précis (arrêts connus, presets)
 * → villes. Retourne null si le lieu est inconnu : le moteur ne doit jamais
 * accepter un point qu'il ne sait pas situer.
 */
export function resolvePlace(name: string, knownPoints: NamedPoint[] = []): Place | null {
  if (!name || !name.trim()) return null;

  const gps = parseGpsLabel(name);
  if (gps) return gps;

  const precise: Place[] = [...knownPoints, ...MOROCCAN_PRESETS].map((p) => ({
    ...p,
    precisionMeters: 0,
  }));
  const query = normalizePlaceName(name);
  const queryKey = primaryKey(name);

  // 1. Correspondance exacte du libellé complet
  const exact = [...precise, ...MOROCCAN_CITIES].find((p) => normalizePlaceName(p.name) === query);
  if (exact) return exact;

  // 2. Correspondance sur la partie principale (avant virgule/parenthèse)
  //    Les villes passent avant les points précis : "Marrakech" désigne la ville,
  //    pas "Marrakech (Gare ONCF)".
  const cityByKey = MOROCCAN_CITIES.find((c) => primaryKey(c.name) === queryKey);
  if (cityByKey) return cityByKey;
  const preciseByKey = precise.find((p) => primaryKey(p.name) === queryKey);
  if (preciseByKey) return preciseByKey;

  // 3. Le libellé contient un nom de ville connu ("Gare de Casablanca")
  const cityContained = MOROCCAN_CITIES.find((c) =>
    ` ${query} `.includes(` ${normalizePlaceName(c.name)} `)
  );
  if (cityContained) return cityContained;

  return null;
}
