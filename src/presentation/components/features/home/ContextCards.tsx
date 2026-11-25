import { Link } from 'react-router-dom';
import { Store } from 'lucide-react';
import type { ContextPlace } from '@domain/rules/contextCards';
import type { VerdictTotals } from '@domain/rules/trendScore';
import { useContextCards } from '@presentation/hooks/home/useContextCards';

interface ContextCardsProps {
  places: ContextPlace[];
  coords: { lat?: number; lng?: number };
  totals?: Record<string, VerdictTotals>;
}

// "Para ahora": 2–3 sugerencias según la hora y el clima. Honestas (dicen por qué salen) y rotan entre los negocios que encajan.
export default function ContextCards({ places, coords, totals }: ContextCardsProps) {
  const cards = useContextCards(places, coords, totals);

  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="context-title" className="mb-6">
      <h2 id="context-title" className="mb-3 px-1 font-flyer-sm text-2xl text-lg-text sm:text-3xl">Para ahora</h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {cards.map(c => (
          <li key={c.id}>
            <Link to={c.to}
              className="flex min-h-[4.5rem] items-center gap-3 rounded-xl border-2 border-lg-surface-2 bg-lg-surface p-3 transition-colors hover:border-lg-accent focus-visible:outline-2 focus-visible:outline-lg-accent">
              {c.image
                ? <img src={c.image} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                : <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-lg-surface-2 text-lg-dim"><Store className="h-5 w-5" /></span>}
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-bold leading-snug text-lg-text">{c.headline}</p>
                <p className="mt-0.5 text-xs font-semibold text-lg-dim">{c.reason}{c.distance ? ` · ${c.distance}` : ''}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
