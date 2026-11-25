import type { CardReaction } from '@presentation/hooks/verdicts/useCardReaction';
import { VERDICT_OPTIONS } from './verdictOptions';

interface VerdictRowProps {
  reaction: CardReaction;
}

// Pantallas grandes: tres botones con ícono y conteo (44 px). En el celular se reacciona con doble toque, así que aquí se oculta.
export default function VerdictRow({ reaction: { counts, mine, react } }: VerdictRowProps) {
  return (
    <div role="group" aria-label="¿Qué te pareció?" className="hidden md:grid grid-cols-3 gap-1">
      {VERDICT_OPTIONS.map(({ key, Icon, label }) => {
        const active = mine === key;
        return (
          <button key={key} type="button" title={label} aria-pressed={active} aria-label={`${label}: ${counts[key]}`}
            onClick={e => {
              e.stopPropagation();
              const r = e.currentTarget.getBoundingClientRect();
              react(key, { x: r.left + r.width / 2, y: r.top });
            }}
            className={`h-11 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 leading-none transition-transform active:scale-90 ${active ? 'bg-lg-accent border-lg-accent text-lg-ink' : 'bg-lg-surface-2 border-transparent text-lg-text hover:border-lg-accent'}`}>
            <Icon className="h-4 w-4" />
            <span className="text-[10px] font-bold">{counts[key]}</span>
          </button>
        );
      })}
    </div>
  );
}
