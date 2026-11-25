import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { EMPTY_VERDICT_SUMMARY, type VerdictKey, type VerdictSummary, type VerdictTarget } from '@domain/entities';
import { verdictsService } from '@lib/supabase/services/verdicts/verdicts';
import { applyVote } from './verdictMath';
import { nudgeLoginOnce } from './loginNudge';

// Veredicto de un click: voto optimista con rollback. Sin sesión se vota igual (por dispositivo). Sin id no hace nada.
export function useVerdict(target: VerdictTarget, id: string | undefined, userId: string | undefined) {
  const [summary, setSummary] = useState<VerdictSummary>(EMPTY_VERDICT_SUMMARY);
  const latest = useRef(summary);
  const touched = useRef(false);

  const update = useCallback((next: VerdictSummary) => { latest.current = next; setSummary(next); }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    touched.current = false;
    verdictsService.load(target, id)
      .then(s => { if (active && !touched.current) update(s); })
      .catch(() => {});
    return () => { active = false; };
  }, [target, id, userId, update]);

  const vote = useCallback(async (key: VerdictKey) => {
    if (!id) return;
    const before = latest.current;
    const next = before.mine === key ? null : key;
    touched.current = true;
    update(applyVote(before, next));
    try {
      await verdictsService.cast(target, id, next);
      if (next && !userId) nudgeLoginOnce();
    } catch (err) {
      console.error('[useVerdict:vote]', err);
      update(before);
      toast.error('No se pudo guardar tu voto, intenta de nuevo');
    }
  }, [target, id, userId, update]);

  return { counts: summary.counts, mine: summary.mine, vote };
}
