import { Ticket } from 'lucide-react';

export function CouponsSection({ coupons }: { coupons: Array<{ code: string; description: string }> }) {
  return (
    <div className="mb-6 -mt-3 p-3 bg-primary-50/60 border border-primary-100 rounded-xl space-y-1.5">
      <p className="text-[11px] font-semibold text-primary-700 uppercase tracking-wider flex items-center gap-1.5">
        <Ticket className="w-3.5 h-3.5" /> Cupones activos
      </p>
      {coupons.map((c, i) => (
        <p key={i} className="text-xs text-stone-600">
          <span className="font-mono font-bold text-primary-700">{c.code}</span> — {c.description}
        </p>
      ))}
    </div>
  );
}
