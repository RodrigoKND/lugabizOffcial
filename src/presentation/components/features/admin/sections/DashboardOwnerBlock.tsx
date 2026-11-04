import { Store } from 'lucide-react';
import { timeAgo } from '../helpers';
import type { AdminBusinessOwner } from '@domain/entities';

export function DashboardOwnerBlock({ owners }: { owners: AdminBusinessOwner[] }) {
  return (
    <div className="bg-lg-surface rounded-2xl p-6 border border-lg-surface-2 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-lg-surface-2 flex items-center justify-center"><Store className="w-4 h-4 text-lg-accent" /></div>
        <div className="flex-1"><h3 className="text-sm font-bold text-lg-text">Dueños de Negocio</h3><p className="text-[10px] text-lg-dim">Actividad en los últimos 30 días</p></div>
        <div className="flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">{owners.filter(o => o.isActive).length} activos</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-lg-surface-2 text-lg-dim font-bold">{owners.filter(o => !o.isActive).length} inactivos</span>
        </div>
      </div>
      {!owners.length ? <p className="text-sm text-lg-dim text-center py-8">Sin dueños registrados</p> : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {owners.map(owner => (
            <div key={owner.userId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-lg-surface-2 transition-colors">
              <div className="w-8 h-8 rounded-full bg-lg-surface-2 overflow-hidden shrink-0 ring-2 ring-lg-surface-2">
                {owner.avatar ? <img src={owner.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Store className="w-3.5 h-3.5 text-lg-dim" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-lg-text truncate">{owner.name}</p>
                <p className="text-[10px] text-lg-dim">{owner.placesCount} lugares · {owner.eventsCount} eventos{owner.lastActivity && ` · ${timeAgo(owner.lastActivity)}`}</p>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${owner.isActive ? 'bg-green-400' : 'bg-stone-300'}`} title={owner.isActive ? 'Activo (30d)' : 'Inactivo'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
