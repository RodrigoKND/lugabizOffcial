import { useState, useEffect } from 'react';
import { verdictsService } from '@lib/supabase/services/verdicts/verdicts';
import type { VerdictTotals } from '@domain/rules/trendScore';

const TTL_MS = 5 * 60_000;
let cache: { at: number; totals: Record<string, VerdictTotals> } | null = null;

// Reacciones por lugar para ordenar la cartelera. Una sola consulta, cacheada 5 min; si falla devuelve undefined y la Home sigue como siempre.
export function usePlaceVerdictTotals(): Record<string, VerdictTotals> | undefined {
  const [totals, setTotals] = useState(() => (cache && Date.now() - cache.at < TTL_MS ? cache.totals : undefined));

  useEffect(() => {
    if (cache && Date.now() - cache.at < TTL_MS) return;
    let active = true;
    verdictsService.getPlaceTotals()
      .then(t => { cache = { at: Date.now(), totals: t }; if (active) setTotals(t); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return totals;
}
