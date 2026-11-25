import { Flame, ThumbsUp, Meh, Store } from 'lucide-react';
import { summarizeInsight } from '@domain/rules/ownerInsight';
import { useOwnerInsights } from '@presentation/hooks/users/useOwnerInsights';

const DAYS = 30;

// Qué consigue cada lugar del dueño en Lugabiz: un dato principal (las reacciones) y números de apoyo. Sin datos inventados.
export default function OwnerInsightsPanel() {
  const { insights, isLoading } = useOwnerInsights(true, DAYS);

  if (isLoading || insights.length === 0) return null;

  return (
    <section aria-labelledby="insights-title" className="space-y-3">
      <h2 id="insights-title" className="font-flyer-sm text-2xl text-lg-text">Tu negocio, últimos {DAYS} días</h2>
      <ul className="space-y-3">
        {insights.map(i => {
          const s = summarizeInsight(i);
          return (
            <li key={i.placeId} className="rounded-xl border-2 border-lg-text bg-lg-surface p-4 poster-shadow">
              <div className="flex items-center gap-3">
                {i.image
                  ? <img src={i.image} alt="" loading="lazy" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lg-surface-2 text-lg-dim"><Store className="h-5 w-5" /></span>}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-lg-dim">{i.name}</p>
                  <p className="font-flyer-sm text-xl leading-tight text-lg-text">{s.headline}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Reacciones">
                <span className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-lg-surface-2 text-sm font-black text-lg-text"><Flame className="h-4 w-4 text-lg-maiz" /> {i.jallalla}</span>
                <span className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-lg-surface-2 text-sm font-black text-lg-text"><ThumbsUp className="h-4 w-4 text-lg-accent" /> {i.bien}</span>
                <span className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-lg-surface-2 text-sm font-black text-lg-text"><Meh className="h-4 w-4 text-lg-dim" /> {i.ahi}</span>
              </div>

              <p className="mt-3 text-xs font-semibold text-lg-dim">
                {i.views} vistas en total · {i.plans} {i.plans === 1 ? 'plan' : 'planes'} · {i.picks} {i.picks === 1 ? 'votación' : 'votaciones'}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
