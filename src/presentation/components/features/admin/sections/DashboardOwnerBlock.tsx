import { Store } from 'lucide-react';
import { timeAgo } from '../helpers';
import type { AdminBusinessOwner } from '@domain/entities';

export function DashboardOwnerBlock({ owners }: { owners: AdminBusinessOwner[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center"><Store className="w-4 h-4 text-primary-500" /></div>
        <div className="flex-1"><h3 className="text-sm font-bold text-stone-800">Dueños de Negocio</h3><p className="text-[10px] text-stone-400">Actividad en los últimos 30 días</p></div>
        <div className="flex gap-1.5">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">{owners.filter(o => o.isActive).length} activos</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-bold">{owners.filter(o => !o.isActive).length} inactivos</span>
        </div>
      </div>
      {!owners.length ? <p className="text-sm text-stone-400 text-center py-8">Sin dueños registrados</p> : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {owners.map(owner => (
            <div key={owner.userId} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-stone-100 overflow-hidden shrink-0 ring-2 ring-stone-200">
                {owner.avatar ? <img src={owner.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Store className="w-3.5 h-3.5 text-stone-400" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-stone-700 truncate">{owner.name}</p>
                <p className="text-[10px] text-stone-400">{owner.placesCount} lugares · {owner.eventsCount} eventos{owner.lastActivity && ` · ${timeAgo(owner.lastActivity)}`}</p>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${owner.isActive ? 'bg-green-400' : 'bg-stone-300'}`} title={owner.isActive ? 'Activo (30d)' : 'Inactivo'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
