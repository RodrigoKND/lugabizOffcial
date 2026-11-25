import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { groupPicksService } from '@lib/supabase/services/social/groupPicks';
import type { GroupPickDetail, GroupPickTarget, VerdictKey } from '@domain/entities';
import { tallyOptions, pickWinner, isVotingComplete, setVote } from '@domain/rules/groupPickScoring';
import { useAuth } from '@presentation/context';

const errorText = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

// Una votación "¿Dónde vamos?": datos, puntajes y acciones (votar, sumar opción, confirmar, cancelar).
export function useGroupPick(pickId: string | undefined) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<GroupPickDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const latest = useRef<GroupPickDetail | null>(null);

  const apply = useCallback((next: GroupPickDetail | null) => { latest.current = next; setDetail(next); }, []);

  const load = useCallback(async () => {
    if (!pickId) { setIsLoading(false); return; }
    try {
      apply(await groupPicksService.getDetail(pickId));
    } catch (err) {
      console.error('[useGroupPick:load]', err);
    } finally {
      setIsLoading(false);
    }
  }, [pickId, apply]);

  useEffect(() => { setIsLoading(true); load(); }, [load]);

  // Los demás votan desde su celular: al volver a la pestaña se traen los votos nuevos (sin sondeo constante).
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  const view = useMemo(() => {
    if (!detail) return null;
    const options = detail.options.map(o => ({ id: o.id, position: o.position }));
    const tally = tallyOptions(options, detail.votes);
    return {
      tally,
      winnerId: pickWinner(tally),
      isComplete: isVotingComplete(detail.members.map(m => m.userId), options, detail.votes),
      isOpen: detail.pick.status === 'open' && detail.pick.closesAt.getTime() > Date.now(),
      myVotes: Object.fromEntries(detail.votes.filter(v => v.userId === user?.id).map(v => [v.optionId, v.verdict])) as Record<string, VerdictKey>,
    };
  }, [detail, user?.id]);

  const vote = useCallback(async (optionId: string, verdict: VerdictKey) => {
    const before = latest.current;
    if (!before || !user) return;
    const mine = before.votes.find(v => v.optionId === optionId && v.userId === user.id)?.verdict;
    const next = mine === verdict ? null : verdict;
    apply({ ...before, votes: setVote(before.votes, optionId, user.id, next) });
    try {
      await groupPicksService.vote(optionId, user.id, next);
    } catch (err) {
      console.error('[useGroupPick:vote]', err);
      apply(before);
      toast.error('No se pudo guardar tu voto, intenta de nuevo');
    }
  }, [user, apply]);

  const run = useCallback(async (action: () => Promise<void>, fallback: string) => {
    try {
      await action();
      await load();
      return true;
    } catch (err) {
      console.error('[useGroupPick:run]', err);
      toast.error(errorText(err, fallback));
      return false;
    }
  }, [load]);

  const addOption = useCallback((target: GroupPickTarget) => (
    pickId && user ? run(() => groupPicksService.addOption(pickId, user.id, target), 'No se pudo agregar la opción') : Promise.resolve(false)
  ), [pickId, user, run]);
  const decide = useCallback((optionId: string) => (
    pickId ? run(() => groupPicksService.decide(pickId, optionId), 'No se pudo confirmar') : Promise.resolve(false)
  ), [pickId, run]);
  const cancel = useCallback(() => (
    pickId ? run(() => groupPicksService.cancel(pickId), 'No se pudo cancelar') : Promise.resolve(false)
  ), [pickId, run]);

  return {
    detail, isLoading, refresh: load,
    isCreator: !!detail && detail.pick.createdBy === user?.id,
    tally: view?.tally ?? [],
    winnerId: view?.winnerId ?? null,
    isComplete: view?.isComplete ?? false,
    isOpen: view?.isOpen ?? false,
    myVotes: view?.myVotes ?? {},
    vote, addOption, decide, cancel,
  };
}
