import { TrendingUp, Hash } from 'lucide-react';
import { C, PIE_COLORS } from '../constants';
import { GrowthChart } from '../charts/GrowthChart';
import { CategoryChart } from '../charts/CategoryChart';
import type { AdminStats, AdminGrowthDataPoint } from '@domain/entities';

export function DashboardGrowthBlock({ growth, stats, pieData }: { growth: AdminGrowthDataPoint[]; stats: AdminStats | null; pieData: Array<{ name: string; value: number }> }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-blue-500" /></div>
          <div><h3 className="text-sm font-bold text-stone-800">Crecimiento del Sistema</h3><p className="text-[10px] text-stone-400">Nuevos registros por mes · últimos 6 meses</p></div>
        </div>
        <GrowthChart data={growth} />
        <div className="flex items-center gap-5 mt-4 pt-4 border-t border-stone-50">
          {[{ color: C.users, label: 'Usuarios' }, { color: C.places, label: 'Lugares' }, { color: C.events, label: 'Eventos' }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: l.color }} /><span className="text-[10px] text-stone-500 font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center"><Hash className="w-4 h-4 text-violet-500" /></div>
          <div><h3 className="text-sm font-bold text-stone-800">Distribución</h3><p className="text-[10px] text-stone-400">Contenido total</p></div>
        </div>
        <div className="flex justify-center mb-3"><CategoryChart data={pieData} /></div>
        <div className="space-y-1.5">
          {pieData.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-[10px] text-stone-500">{d.name}</span>
              </div>
              <span className="text-[10px] font-bold text-stone-700 tabular-nums">{d.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
