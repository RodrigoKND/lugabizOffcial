import { motion } from 'framer-motion';
import { Users, MapPin, Calendar, MessageSquare, Ban, Store, Wifi, ClipboardList } from 'lucide-react';
import type { AdminStats, AdminAdvancedStats } from '@domain/entities';

export function DashboardKpiCards({ stats, advanced }: { stats: AdminStats | null; advanced: AdminAdvancedStats | null }) {
  const kpis = [
    { label: 'Total Usuarios', value: stats?.users ?? 0, icon: Users, light: 'bg-blue-50', text: 'text-blue-600', desc: 'registrados' },
    { label: 'Online Ahora', value: advanced?.onlineUsers ?? 0, icon: Wifi, light: 'bg-green-50', text: 'text-green-600', desc: 'últ. 10 min' },
    { label: 'Baneados', value: advanced?.banned ?? 0, icon: Ban, light: 'bg-red-50', text: 'text-red-600', desc: 'suspendidos' },
    { label: 'Dueños', value: advanced?.owners ?? 0, icon: Store, light: 'bg-primary-50', text: 'text-primary-600', desc: `${advanced?.activeOwners ?? 0} activos` },
    { label: 'Lugares', value: stats?.places ?? 0, icon: MapPin, light: 'bg-primary-50', text: 'text-primary-600', desc: 'publicados' },
    { label: 'Eventos', value: stats?.events ?? 0, icon: Calendar, light: 'bg-emerald-50', text: 'text-emerald-600', desc: 'creados' },
    { label: 'Reseñas', value: stats?.reviews ?? 0, icon: MessageSquare, light: 'bg-violet-50', text: 'text-violet-600', desc: 'escritas' },
    { label: 'Encuestas', value: advanced?.surveysTotal ?? stats?.surveys ?? 0, icon: ClipboardList, light: 'bg-cyan-50', text: 'text-cyan-600', desc: 'de mercado' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {kpis.map((k, i) => (
        <motion.div key={k.label}
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md transition-all">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.light}`}>
            <k.icon className={`w-4 h-4 ${k.text}`} />
          </div>
          <p className="text-2xl font-bold text-stone-800 leading-none tabular-nums">{k.value.toLocaleString()}</p>
          <p className="text-[11px] font-bold text-stone-700 mt-1.5 leading-tight">{k.label}</p>
          <p className="text-[10px] text-stone-400 mt-0.5">{k.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
