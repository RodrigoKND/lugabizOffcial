import { supabase } from '@lib/supabase/client';
import type { OwnerInsight } from '@domain/entities/OwnerInsight';

interface InsightRow {
  place_id: string; name: string; image?: string | null;
  views: number | string; plans: number | string; jallalla: number | string; bien: number | string; ahi: number | string;
  picks: number | string; picks_won: number | string;
}

// Los bigint de Postgres llegan como texto.
export function mapInsight(r: InsightRow): OwnerInsight {
  return {
    placeId: r.place_id, name: r.name, image: r.image ?? undefined,
    views: Number(r.views), plans: Number(r.plans), jallalla: Number(r.jallalla), bien: Number(r.bien), ahi: Number(r.ahi),
    picks: Number(r.picks), picksWon: Number(r.picks_won),
  };
}

export const ownerInsightsService = {
  // Solo devuelve los lugares del propio usuario (lo garantiza la función SQL).
  async get(days = 30): Promise<OwnerInsight[]> {
    const { data, error } = await supabase.rpc('get_owner_insights', { p_days: days });
    if (error) throw error;
    return ((data ?? []) as InsightRow[]).map(mapInsight);
  },
};
