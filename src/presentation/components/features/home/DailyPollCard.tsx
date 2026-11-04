import toast from 'react-hot-toast';
import { useAuth } from '@presentation/context';
import { useDailyPoll } from '@presentation/hooks/home/useDailyPoll';
import type { PollChoice } from '@lib/supabase/services/chispa/dailyPolls';

// "Ta' pues del día": votación local diaria con resultados al votar.
const DailyPollCard: React.FC = () => {
  const { user } = useAuth();
  const { poll, percentages, myVote, vote } = useDailyPoll(user?.id);

  const handleVote = async (choice: PollChoice) => {
    if (!user) { toast.error('Inicia sesión para votar'); return; }
    if (!(await vote(choice))) toast.error('No pudimos registrar tu voto');
  };

  const options = poll
    ? [
        { key: 'a' as const, label: poll.optionA, pct: percentages.a },
        { key: 'b' as const, label: poll.optionB, pct: percentages.b },
      ]
    : [];

  return (
    <div className="bg-lg-surface rounded-3xl p-4">
      <div className="flex items-center justify-between gap-2 mb-3">
        <h3 className="font-flyer-sm text-xl text-lg-text">{poll?.question ?? 'La pregunta de hoy llega pronto'}</h3>
        <span className="sticker-tag whitespace-nowrap bg-lg-accent text-lg-ink text-[10px] px-2.5 py-1 rounded-full">Ta' pues del día</span>
      </div>
      {poll && (
        <div className="grid grid-cols-2 gap-2">
          {options.map(o => (
            <button key={o.key} onClick={() => handleVote(o.key)} disabled={!!myVote}
              className="relative overflow-hidden rounded-2xl bg-lg-surface-2 px-3 py-3 text-left font-bold text-sm text-lg-text disabled:cursor-default">
              {myVote && <span className="absolute inset-y-0 left-0 bg-lg-accent/90" style={{ width: `${o.pct}%` }} />}
              <span className={`relative flex justify-between gap-2 ${myVote && o.pct >= 50 ? 'text-lg-ink' : ''}`}>
                {o.label}
                {myVote && <span>{o.pct}%</span>}
              </span>
            </button>
          ))}
        </div>
      )}
      {poll && (
        <p className="mt-2 text-[11px] font-semibold text-lg-dim">
          {myVote ? `${percentages.total} cochabambinos ya votaron` : 'Vota para ver cómo va Cochabamba'}
        </p>
      )}
    </div>
  );
};

export default DailyPollCard;
