import { supabase } from '@lib/supabase';
import { getDeviceId } from '@infrastructure/utils/deviceId';
import { VERDICT_KEYS, type VerdictKey, type VerdictSummary, type VerdictTarget } from '@domain/entities';
import type { VerdictTotals } from '@domain/rules/trendScore';
import { createSummaryLoader } from './verdictLoader';

interface SummaryRow {
  target_id: string;
  jallalla: number | string;
  bien: number | string;
  ahi: number | string;
  mine: string | null;
}

// Los bigint de Postgres llegan como texto: se pasan a número y se valida el voto propio.
export function rowsToSummaries(rows: SummaryRow[]): Map<string, VerdictSummary> {
  return new Map(rows.map(r => [r.target_id, {
    counts: { jallalla: Number(r.jallalla), bien: Number(r.bien), ahi: Number(r.ahi) },
    mine: VERDICT_KEYS.includes(r.mine as VerdictKey) ? (r.mine as VerdictKey) : null,
  }]));
}

async function fetchBatch(type: VerdictTarget, ids: string[]) {
  const { data, error } = await supabase.rpc('get_verdict_summaries', {
    p_target_type: type, p_ids: ids, p_device_id: getDeviceId(),
  });
  if (error) throw error;
  return rowsToSummaries((data ?? []) as SummaryRow[]);
}

const loader = createSummaryLoader(fetchBatch);

interface TotalsRow { target_id: string; jallalla: number | string; bien: number | string; ahi: number | string }

// Reacciones por lugar de los últimos días, en una sola llamada (para ordenar la cartelera). Falla en silencio: sin totales todo sigue como antes.
export function rowsToTotals(rows: TotalsRow[]): Record<string, VerdictTotals> {
  return Object.fromEntries(rows.map(r => [r.target_id, { jallalla: Number(r.jallalla), bien: Number(r.bien), ahi: Number(r.ahi) }]));
}

export const verdictsService = {
  load: loader.load,

  async getPlaceTotals(days = 30, limit = 60): Promise<Record<string, VerdictTotals>> {
    const { data, error } = await supabase.rpc('get_place_verdict_totals', { p_days: days, p_limit: limit });
    if (error) throw error;
    return rowsToTotals((data ?? []) as TotalsRow[]);
  },

  // null quita el voto. Se invalida la caché para que la próxima carga traiga los conteos reales.
  async cast(type: VerdictTarget, id: string, verdict: VerdictKey | null): Promise<void> {
    const { error } = await supabase.rpc('cast_verdict', {
      p_target_type: type, p_target_id: id, p_verdict: verdict, p_device_id: getDeviceId(),
    });
    if (error) throw error;
    loader.invalidate(type, id);
  },
};
