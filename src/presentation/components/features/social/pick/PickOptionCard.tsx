import { Store } from 'lucide-react';
import type { GroupPickOption, VerdictKey } from '@domain/entities';
import type { OptionTally } from '@domain/rules/groupPickScoring';
import { VERDICT_OPTIONS } from '@presentation/components/features/cartel/verdictOptions';

interface PickOptionCardProps {
  option: GroupPickOption;
  tally?: OptionTally;
  mine?: VerdictKey;
  isLeader: boolean;
  isWinner: boolean;
  canVote: boolean;
  onVote: (verdict: VerdictKey) => void;
}

// Una opción de la votación: foto, nombre, puntos y los 3 botones de veredicto (un toque por opción).
export default function PickOptionCard({ option, tally, mine, isLeader, isWinner, canVote, onVote }: PickOptionCardProps) {
  const border = isWinner ? 'border-lg-maiz poster-shadow' : isLeader ? 'border-lg-text' : 'border-lg-surface-2';

  return (
    <li className={`overflow-hidden rounded-xl border-2 bg-lg-surface ${border}`}>
      <div className="flex items-center gap-3 p-3">
        {option.image
          ? <img src={option.image} alt="" loading="lazy" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
          : <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-lg-surface-2 text-lg-dim"><Store className="h-6 w-6" /></span>}
        <div className="min-w-0 flex-1">
          <p className="truncate font-flyer-sm text-xl text-lg-text">{option.name}</p>
          <p className="text-xs font-bold text-lg-dim">{tally?.score ?? 0} puntos · {tally?.votes ?? 0} {tally?.votes === 1 ? 'voto' : 'votos'}</p>
        </div>
        {(isWinner || isLeader) && (
          <span className="shrink-0 bg-lg-maiz px-2.5 py-1 text-[11px] text-lg-ink sticker-tag">{isWinner ? 'Ganó' : 'Va ganando'}</span>
        )}
      </div>

      <div role="group" aria-label={`Tu voto para ${option.name}`} className="grid grid-cols-3 gap-1 px-3 pb-3">
        {VERDICT_OPTIONS.map(({ key, Icon, label }) => {
          const active = mine === key;
          return (
            <button key={key} type="button" disabled={!canVote} aria-pressed={active} aria-label={`${label}: ${tally?.counts[key] ?? 0}`}
              onClick={() => onVote(key)}
              className={`flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border-2 text-[11px] font-bold leading-none transition-transform active:scale-90 disabled:opacity-50 ${active ? 'border-lg-accent bg-lg-accent text-lg-ink' : 'border-transparent bg-lg-surface-2 text-lg-text'}`}>
              <Icon className="h-4 w-4" />
              {label} · {tally?.counts[key] ?? 0}
            </button>
          );
        })}
      </div>
    </li>
  );
}
