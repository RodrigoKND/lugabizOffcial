// Reglas puras de cercanía. H3 solo sirve de filtro grueso (ver proximityEngine); la decisión
// "estás cerca" la toma la distancia exacta y la precisión del GPS.

const EARTH_RADIUS_M = 6_371_000;
const rad = (deg: number) => (deg * Math.PI) / 180;

// Distancia en metros entre dos coordenadas (fórmula de haversine).
export function haversineMeters(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const h = Math.sin(rad(bLat - aLat) / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

// Lugares dentro de `radiusM` metros, del más cercano al más lejano, con su distancia.
export function placesWithin<T extends { latitude: number; longitude: number }>(
  lat: number, lng: number, places: T[], radiusM: number,
): Array<T & { distanceM: number }> {
  return places
    .map(p => ({ ...p, distanceM: haversineMeters(lat, lng, p.latitude, p.longitude) }))
    .filter(p => p.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
}

// ¿Ya se avisó de este lugar hace poco? Evita repetir el aviso cada vez que llega una lectura de ubicación.
export function isCoolingDown(lastNotifiedAt: number | undefined, now: number, cooldownMs: number): boolean {
  return lastNotifiedAt !== undefined && now - lastNotifiedAt < cooldownMs;
}

// Una lectura de GPS imprecisa (o sin dato de precisión) no vale para decir "estás aquí".
export function isPreciseEnough(accuracyM: number | null | undefined, maxM: number): boolean {
  return typeof accuracyM === 'number' && accuracyM <= maxM;
}
