import { getNearbyCells, latLngToCell } from '@infrastructure/utils/h3';
import { haversineMeters, isCoolingDown, isPreciseEnough, placesWithin } from '@domain/rules/proximity';

export interface EnginePlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface EngineDeps {
  // Lugares alrededor de un punto (ya con coordenadas). Se llama poco: el resultado se guarda en memoria.
  loadPlaces: (lat: number, lng: number) => Promise<EnginePlace[]>;
  // Qué hacer al detectar un lugar cerca: avisar y registrar el check-in.
  onNearby: (place: EnginePlace, distanceM: number, accuracyM: number) => Promise<void>;
  // Persistencia simple (clave → texto) para no repetir avisos entre reinicios de la app.
  store: { get: (key: string) => string | null; set: (key: string, value: string) => void };
  now?: () => number;
}

export interface EngineOptions {
  radiusM?: number;
  maxAccuracyM?: number;
  cooldownMs?: number;
  refetchMeters?: number;
  maxPerFix?: number;
}

export interface LocationFix {
  lat: number;
  lng: number;
  accuracy?: number | null;
}

const DAY_MS = 24 * 3_600_000;
const CACHE_TTL_MS = 30 * 60_000;

// Decide, por cada lectura de ubicación, de qué lugares avisar. Barato para la batería: H3 (res. 9) descarta lo lejano
// sin calcular distancias, la lista de lugares se cachea, y la distancia exacta + la precisión del GPS deciden.
export function createProximityEngine(deps: EngineDeps, options: EngineOptions = {}) {
  const { radiusM = 150, maxAccuracyM = 100, cooldownMs = DAY_MS, refetchMeters = 1500, maxPerFix = 2 } = options;
  const now = () => (deps.now ? deps.now() : Date.now());
  let cache: { lat: number; lng: number; at: number; places: EnginePlace[] } | null = null;
  let busy = false;

  async function placesAround(lat: number, lng: number): Promise<EnginePlace[]> {
    if (cache && haversineMeters(cache.lat, cache.lng, lat, lng) < refetchMeters && now() - cache.at < CACHE_TTL_MS) return cache.places;
    const places = await deps.loadPlaces(lat, lng);
    cache = { lat, lng, at: now(), places };
    return places;
  }

  const lastNotified = (id: string) => {
    const raw = deps.store.get(`prox:${id}`);
    return raw === null ? undefined : Number(raw);
  };

  async function onLocation(fix: LocationFix): Promise<string[]> {
    if (busy || !isPreciseEnough(fix.accuracy, maxAccuracyM)) return [];
    busy = true;
    try {
      let places: EnginePlace[];
      try { places = await placesAround(fix.lat, fix.lng); } catch { return []; }

      // Filtro grueso con H3: el radio + una celda de margen.
      const cells = new Set(getNearbyCells(fix.lat, fix.lng, radiusM / 1000 + 0.3));
      const candidates = places.filter(p => cells.has(latLngToCell(p.latitude, p.longitude)));
      const hits = placesWithin(fix.lat, fix.lng, candidates, radiusM)
        .filter(p => !isCoolingDown(lastNotified(p.id), now(), cooldownMs))
        .slice(0, maxPerFix);

      const fired: string[] = [];
      for (const hit of hits) {
        try {
          await deps.onNearby(hit, hit.distanceM, fix.accuracy as number);
          deps.store.set(`prox:${hit.id}`, String(now()));
          fired.push(hit.id);
        } catch (err) {
          console.error('[proximityEngine:onNearby]', err); // sin marca de espera: se reintenta con la próxima lectura
        }
      }
      return fired;
    } finally {
      busy = false;
    }
  }

  return { onLocation };
}
