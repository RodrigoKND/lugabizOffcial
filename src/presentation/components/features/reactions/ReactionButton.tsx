import { createPortal } from 'react-dom';
import { Heart } from 'lucide-react';
import { useReactionBurst } from '@presentation/hooks/reactions/useReactionBurst';

interface ReactionButtonProps {
  className?: string;
}

// Corazón de la tarjeta: al tocarlo salen frases cortas de Cochabamba flotando. No pide sesión.
const ReactionButton: React.FC<ReactionButtonProps> = ({ className = 'w-7 h-7' }) => {
  const { items, fire } = useReactionBurst();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    fire({ x: r.left + r.width / 2, y: r.top });
  };

  return (
    <>
      <button onClick={handleClick} aria-label="Reaccionar con una frase de Cochabamba"
        className={`${className} rounded-full flex items-center justify-center bg-lg-text/90 hover:bg-lg-text transition-all active:scale-90`}>
        <Heart className={`w-3.5 h-3.5 text-lg-ink transition-all ${items.length ? 'fill-lg-ink scale-110' : ''}`} />
      </button>
      {items.length > 0 && createPortal(
        items.map((p, i) => (
          <span key={p.id} aria-hidden="true"
            className={`lg-float-phrase fixed z-[300] pointer-events-none whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${i % 2 ? 'bg-lg-text text-lg-ink' : 'bg-lg-accent text-lg-ink'}`}
            style={{ left: p.left, top: p.top, animationDelay: `${p.delay}ms`, '--dx': `${p.dx}px`, '--rot': `${p.rot}deg` } as React.CSSProperties}>
            {p.text}
          </span>
        )),
        document.body,
      )}
    </>
  );
};

export default ReactionButton;
