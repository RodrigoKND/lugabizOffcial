import { Flame } from 'lucide-react';
import type { CardReaction } from '@presentation/hooks/verdicts/useCardReaction';
import { DOUBLE_TAP_VERDICT } from './verdictOptions';

interface ReactionChipProps {
  reaction: CardReaction;
}

// Celular: marca visible del "Al palo" (se da con doble toque sobre la foto). También es botón para quien no pueda hacer el gesto.
export default function ReactionChip({ reaction: { counts, mine, react } }: ReactionChipProps) {
  const active = mine === DOUBLE_TAP_VERDICT;

  return (
    <button type="button" aria-pressed={active} aria-label={`Al palo: ${counts[DOUBLE_TAP_VERDICT]}. Toca dos veces la foto para reaccionar`}
      onClick={e => {
        e.stopPropagation();
        const r = e.currentTarget.getBoundingClientRect();
        react(DOUBLE_TAP_VERDICT, { x: r.left + r.width / 2, y: r.top });
      }}
      className={`absolute bottom-1.5 left-1.5 z-10 flex h-9 items-center gap-1 rounded-full px-2.5 text-xs font-black transition-transform active:scale-90 md:hidden ${active ? 'bg-lg-maiz text-lg-ink' : 'bg-lg-ink/75 text-lg-text'}`}>
      <Flame className={`h-4 w-4 ${active ? 'fill-lg-ink' : ''}`} />
      {counts[DOUBLE_TAP_VERDICT]}
    </button>
  );
}
