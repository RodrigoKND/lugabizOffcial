import type { BroadcastAudience } from '@lib/supabase';
import { AUDIENCES } from '../constants';

export function AudienceSelector({ value, onChange }: { value: BroadcastAudience; onChange: (v: BroadcastAudience) => void }) {
  return (
    <div>
      <label className="text-xs font-semibold text-stone-600 mb-2 block">¿A quién?</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {AUDIENCES.map(a => {
          const active = value === a.id;
          return (
            <button key={a.id} onClick={() => onChange(a.id as BroadcastAudience)}
              className={`text-left p-3 rounded-xl border transition-all ${active ? 'border-primary-300 bg-primary-50 ring-2 ring-primary-100' : 'border-stone-200 hover:border-stone-300'}`}>
              <a.icon className={`w-4 h-4 mb-1 ${active ? 'text-primary-500' : 'text-stone-400'}`} />
              <p className={`text-xs font-semibold ${active ? 'text-primary-700' : 'text-stone-700'}`}>{a.label}</p>
              <p className="text-[10px] text-stone-400 leading-tight">{a.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
