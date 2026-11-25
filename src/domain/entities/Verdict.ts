export type VerdictKey = 'jallalla' | 'bien' | 'ahi';

export type VerdictTarget = 'place' | 'event';

export const VERDICT_KEYS: VerdictKey[] = ['jallalla', 'bien', 'ahi'];

export interface VerdictSummary {
  counts: Record<VerdictKey, number>;
  mine: VerdictKey | null;
}

export const EMPTY_VERDICT_SUMMARY: VerdictSummary = {
  counts: { jallalla: 0, bien: 0, ahi: 0 },
  mine: null,
};
