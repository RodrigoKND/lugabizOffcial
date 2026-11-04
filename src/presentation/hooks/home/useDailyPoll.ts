import { useCallback, useEffect, useMemo, useState } from 'react';
import { dailyPollsService, type DailyPoll, type PollChoice } from '@lib/supabase/services/chispa/dailyPolls';
import { pollPercentages } from '@lib/supabase/services/chispa/pollMath';

// Votación diaria "Ta' pues": carga la pregunta activa, mis votos y vota con actualización optimista.
export function useDailyPoll(userId?: string) {
  const [poll, setPoll] = useState<DailyPoll | null>(null);
  const [votes, setVotes] = useState({ votesA: 0, votesB: 0 });
  const [myVote, setMyVote] = useState<PollChoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const active = await dailyPollsService.getActivePoll();
      if (cancelled) return;
      setPoll(active);
      if (active) {
        const [counts, mine] = await Promise.all([
          dailyPollsService.getVotes(active.id),
          userId ? dailyPollsService.getMyVote(active.id, userId) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setVotes(counts);
        setMyVote(mine);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const vote = useCallback(async (choice: PollChoice) => {
    if (!poll || !userId || myVote) return false;
    setMyVote(choice);
    setVotes(v => (choice === 'a' ? { ...v, votesA: v.votesA + 1 } : { ...v, votesB: v.votesB + 1 }));
    try {
      await dailyPollsService.vote(poll.id, userId, choice);
      return true;
    } catch {
      setMyVote(null);
      setVotes(v => (choice === 'a' ? { ...v, votesA: v.votesA - 1 } : { ...v, votesB: v.votesB - 1 }));
      return false;
    }
  }, [poll, userId, myVote]);

  const percentages = useMemo(() => pollPercentages(votes.votesA, votes.votesB), [votes]);
  return { poll, percentages, myVote, loading, vote };
}
