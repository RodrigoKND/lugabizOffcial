import { Activity, Clock, Eye, UserPlus, Users, Wifi } from 'lucide-react';
import type { AdminAdvancedStats, AdminEngagementMetrics } from '@domain/entities';

export function DashboardEngagementBlock({ engagement, advanced }: { engagement: AdminEngagementMetrics | null; advanced: AdminAdvancedStats | null }) {
  return (
    <div className="bg-lg-surface rounded-2xl p-6 border border-lg-surface-2 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center"><Activity className="w-4 h-4 text-teal-500" /></div>
        <div><h3 className="text-sm font-bold text-lg-text">Métricas de Engagement</h3><p className="text-[10px] text-lg-dim">Comportamiento de usuarios</p></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Usuarios / Día', value: engagement?.dailyActiveUsers ?? 0, unit: 'DAU', icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
          { label: 'Usuarios / Sem', value: engagement?.weeklyActiveUsers ?? 0, unit: 'WAU', icon: Users, bg: 'bg-violet-50', color: 'text-violet-600' },
          { label: 'Sesión Promedio', value: engagement?.avgSessionMinutes ?? 0, unit: 'min', icon: Clock, bg: 'bg-teal-50', color: 'text-teal-600' },
          { label: 'Acción Top', value: engagement?.topAction ?? '—', unit: '', icon: Eye, bg: 'bg-lg-surface-2', color: 'text-lg-accent' },
        ].map((m, i) => (
          <div key={i} className={`${m.bg} rounded-xl p-3.5`}>
            <m.icon className={`w-4 h-4 ${m.color} mb-2`} />
            <p className="text-base font-bold text-lg-text truncate leading-none">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}{m.unit && <span className="text-[10px] font-normal text-lg-dim ml-1">{m.unit}</span>}</p>
            <p className="text-[10px] text-lg-dim mt-1">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 bg-green-50 border border-green-200/80 rounded-xl flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-green-700">{advanced?.onlineUsers ?? 0} usuario{(advanced?.onlineUsers ?? 0) !== 1 ? 's' : ''} en línea ahora</p>
          <p className="text-[10px] text-green-600">Actividad en los últimos 10 minutos</p>
        </div>
        <Wifi className="w-4 h-4 text-green-500 shrink-0" />
      </div>
    </div>
  );
}
