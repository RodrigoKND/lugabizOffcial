import { supabase } from '@lib/supabase';
import { getDeviceId } from '@infrastructure/utils/deviceId';
import { VERDICT_KEYS, type VerdictKey, type VerdictSummary, type VerdictTarget } from '@domain/entities';
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

export const verdictsService = {
  load: loader.load,

  // null quita el voto. Se invalida la caché para que la próxima carga traiga los conteos reales.
  async cast(type: VerdictTarget, id: string, verdict: VerdictKey | null): Promise<void> {
    const { error } = await supabase.rpc('cast_verdict', {
      p_target_type: type, p_target_id: id, p_verdict: verdict, p_device_id: getDeviceId(),
    });
    if (error) throw error;
    loader.invalidate(type, id);
  },
};
