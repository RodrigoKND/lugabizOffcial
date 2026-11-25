import { useMemo } from 'react';
import { buildContextCards, type ContextPlace } from '@domain/rules/contextCards';
import type { VerdictTotals } from '@domain/rules/trendScore';
import { useHomeWeather } from './useHomeWeather';

interface Coords { lat?: number; lng?: number }

// Sugerencias por la hora y el clima con lo que la Home ya tiene (sin peticiones nuevas salvo el clima, que se cachea).
export function useContextCards(places: ContextPlace[], coords: Coords, totals?: Record<string, VerdictTotals>) {
  const tempC = useHomeWeather(coords.lat, coords.lng);
  const hasCoords = coords.lat !== undefined && coords.lng !== undefined;

  return useMemo(() => buildContextCards({
    now: new Date(), tempC, places, totals,
    coords: hasCoords ? { lat: coords.lat as number, lng: coords.lng as number } : undefined,
  }), [tempC, places, totals, hasCoords, coords.lat, coords.lng]);
}
