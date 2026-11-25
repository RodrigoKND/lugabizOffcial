import { createPortal } from 'react-dom';
import type { FloatingPhrase } from '@presentation/hooks/reactions/useReactionBurst';

interface PhraseBurstProps {
  items: FloatingPhrase[];
}

// Frases de Cochabamba que suben y se desvanecen al votar. Van en el body para no quedar cortadas por la tarjeta.
export default function PhraseBurst({ items }: PhraseBurstProps) {
  if (!items.length) return null;

  return createPortal(
    items.map((p, i) => (
      <span key={p.id} aria-hidden="true"
        className={`lg-float-phrase fixed z-[300] pointer-events-none whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-extrabold ${i % 2 ? 'bg-lg-text text-lg-ink' : 'bg-lg-accent text-lg-ink'}`}
        style={{ left: p.left, top: p.top, animationDelay: `${p.delay}ms`, '--dx': `${p.dx}px`, '--rot': `${p.rot}deg` } as React.CSSProperties}>
        {p.text}
      </span>
    )),
    document.body,
  );
}
