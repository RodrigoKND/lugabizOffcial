import type { BroadcastAudience } from '@lib/supabase';
import { AUDIENCES } from '../constants';

export function AudienceSelector({ value, onChange }: { value: BroadcastAudience; onChange: (v: BroadcastAudience) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-lg-dim mb-2 block">¿A quién?</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AUDIENCES.map(a => {
          const active = value === a.id;
          return (
            <button key={a.id} onClick={() => onChange(a.id as BroadcastAudience)}
              className={`text-left p-3 rounded-xl border transition-all ${active ? 'border-primary-300 bg-lg-surface-2 ring-2 ring-lg-surface-2' : 'border-lg-surface-2 hover:border-lg-surface-2'}`}>
              <a.icon className={`w-4 h-4 mb-1 ${active ? 'text-lg-accent' : 'text-lg-dim'}`} />
              <p className={`text-xs font-semibold ${active ? 'text-lg-accent' : 'text-lg-text'}`}>{a.label}</p>
              <p className="text-[10px] text-lg-dim leading-tight">{a.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
