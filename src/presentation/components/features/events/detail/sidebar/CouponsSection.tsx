import { Ticket } from 'lucide-react';

export function CouponsSection({ coupons }: { coupons: Array<{ code: string; description: string }> }) {
  return (
    <section aria-label="Cupones activos" className="mt-3 space-y-2 rounded-lg bg-lg-surface-2 p-3">
      <h2 className="flex items-center gap-1.5 text-xs font-bold text-lg-accent">
        <Ticket className="h-4 w-4" /> Cupones activos
      </h2>
      {coupons.map(c => (
        <p key={c.code} className="text-sm text-lg-text">
          <span className="rounded bg-lg-maiz px-1.5 py-0.5 font-mono text-xs font-bold text-lg-ink">{c.code}</span>{' '}
          <span className="text-lg-dim">{c.description}</span>
        </p>
      ))}
    </section>
  );
}
