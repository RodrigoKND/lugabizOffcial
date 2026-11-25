import type { VerdictKey, VerdictSummary } from '@domain/entities';

// Resultado local de un voto, para mostrarlo al instante: quita el anterior (si había) y suma el nuevo.
export function applyVote(summary: VerdictSummary, next: VerdictKey | null): VerdictSummary {
  const counts = { ...summary.counts };
  if (summary.mine) counts[summary.mine] = Math.max(0, counts[summary.mine] - 1);
  if (next) counts[next] += 1;
  return { counts, mine: next };
}
