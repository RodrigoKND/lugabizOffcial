import { useEffect, useState } from 'react';
import { dailyPollsService, type DailyPoll } from '@lib/supabase/services/chispa/dailyPolls';
import { pollPercentages } from '@lib/supabase/services/chispa/pollMath';

// Resultado en vivo de la pregunta de hoy (si no existía, el sistema la crea al consultarla).
export function PollToday() {
  const [poll, setPoll] = useState<DailyPoll | null>(null);
  const [votes, setVotes] = useState({ votesA: 0, votesB: 0 });

  useEffect(() => {
    let active = true;
    dailyPollsService.getActivePoll().then(async p => {
      if (!active || !p) return;
      setPoll(p);
      const v = await dailyPollsService.getVotes(p.id);
      if (active) setVotes(v);
    });
    return () => { active = false; };
  }, []);

  if (!poll) return <p className="p-5 text-sm text-lg-dim border-b border-lg-surface-2">Hoy aún no hay pregunta activa.</p>;
  const pct = pollPercentages(votes.votesA, votes.votesB);

  return (
    <div className="p-5 border-b border-lg-surface-2">
      <p className="text-[11px] font-bold uppercase text-lg-dim">Hoy en la Home</p>
      <p className="font-bold text-lg-text mt-1">{poll.question}</p>
      <div className="mt-3 space-y-2">
        {([[poll.optionA, pct.a], [poll.optionB, pct.b]] as const).map(([label, value]) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-lg-text font-semibold"><span>{label}</span><span>{value}%</span></div>
            <div className="h-2 rounded-full bg-lg-surface-2 overflow-hidden"><div className="h-full rounded-full bg-lg-accent" style={{ width: `${value}%` }} /></div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-lg-dim">{pct.total} {pct.total === 1 ? 'voto' : 'votos'}</p>
    </div>
  );
}
