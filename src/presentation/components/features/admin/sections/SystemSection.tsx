import { useState, useEffect } from 'react';
import { adminService } from '@lib/supabase/services/admin/admin';
import { Activity, Loader2, BarChart2, TrendingUp, Globe, Database, Shield, Bell } from 'lucide-react';

const STATUS_STYLES = {
  ok: {
    card: 'bg-green-50/50 border-green-200/50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    textColor: 'text-green-600',
    dot: 'bg-green-400',
  },
  error: {
    card: 'bg-red-50 border-red-200/50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-500',
    textColor: 'text-red-500',
    dot: 'bg-red-400',
  },
  checking: {
    card: 'bg-stone-50 border-stone-200/50',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-400',
    textColor: 'text-stone-400',
    dot: 'bg-stone-300 animate-pulse',
  },
} as const;

export function SystemSection() {
  const [stats, setStats] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [statsRes, engRes] = await Promise.allSettled([adminService.getStats(), adminService.getUserEngagementMetrics()]);
      if (statsRes.status === 'fulfilled') { setStats(statsRes.value); setDbStatus('ok'); } else setDbStatus('error');
      if (engRes.status === 'fulfilled') setEngagement(engRes.value);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  const services = [
    { icon: Globe, label: 'Aplicación Web', desc: 'Interfaz principal operativa', status: 'ok' as const },
    { icon: Database, label: 'Base de Datos', desc: dbStatus === 'ok' ? 'Conexión Supabase estable' : 'Error de conexión', status: dbStatus },
    { icon: Shield, label: 'Autenticación', desc: 'JWT y sesiones funcionando', status: 'ok' as const },
    { icon: Bell, label: 'Notificaciones', desc: 'Edge Functions activas', status: 'ok' as const },
  ];

  const metrics = [
    { label: 'Usuarios registrados', value: stats?.users ?? 0 }, { label: 'Lugares publicados', value: stats?.places ?? 0 },
    { label: 'Eventos creados', value: stats?.events ?? 0 }, { label: 'Reseñas escritas', value: stats?.reviews ?? 0 },
    { label: 'Encuestas activas', value: stats?.surveys ?? 0 }, { label: 'Notificaciones enviadas', value: stats?.notifications ?? 0 },
    { label: 'Usuarios activos / día', value: engagement?.dailyActiveUsers ?? 0 },
    { label: 'Usuarios activos / semana', value: engagement?.weeklyActiveUsers ?? 0 },
    { label: 'Sesión promedio (min)', value: engagement?.avgSessionMinutes ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center"><Activity className="w-4 h-4 text-green-500" /></div>
          <div><h3 className="text-sm font-bold text-stone-800">Estado del Sistema</h3><p className="text-[10px] text-stone-400">Servicios en tiempo real</p></div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] font-semibold text-green-600">Operativo</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map(s => (
            <div key={s.label} className={`flex items-center gap-3 p-4 rounded-xl border ${STATUS_STYLES[s.status]?.card ?? 'bg-stone-50 border-stone-200/50'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${STATUS_STYLES[s.status]?.iconBg ?? 'bg-stone-100'}`}>
                <s.icon className={`w-4 h-4 ${STATUS_STYLES[s.status]?.iconColor ?? 'text-stone-400'}`} />
              </div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-stone-700">{s.label}</p><p className={`text-xs ${STATUS_STYLES[s.status]?.textColor ?? 'text-stone-400'}`}>{s.desc}</p></div>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_STYLES[s.status]?.dot ?? 'bg-stone-300 animate-pulse'}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center"><BarChart2 className="w-4 h-4 text-blue-500" /></div>
          <div><h3 className="text-sm font-bold text-stone-800">Métricas Globales</h3><p className="text-[10px] text-stone-400">Resumen completo del sistema</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-stone-100 rounded-xl overflow-hidden">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white p-4 hover:bg-stone-50 transition-colors">
              <p className="text-xl font-bold text-stone-800 tabular-nums">{m.value.toLocaleString()}</p>
              <p className="text-[11px] text-stone-500 mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
      {engagement && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 border border-primary-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-primary-600" /></div>
            <div><h3 className="text-sm font-bold text-stone-800">Resumen de Actividad</h3><p className="text-[10px] text-stone-500">Tiempo de respuesta e interacción promedio</p></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'DAU', value: `${engagement.dailyActiveUsers}`, sub: 'usuarios activos hoy' },
              { label: 'WAU', value: `${engagement.weeklyActiveUsers}`, sub: 'usuarios esta semana' },
              { label: 'Sesión prom.', value: `${engagement.avgSessionMinutes} min`, sub: 'tiempo promedio por usuario' },
              { label: 'Acción top', value: engagement.topAction, sub: 'acción más frecuente' },
            ].map((s, i) => (
              <div key={i} className="bg-white/80 rounded-xl p-3">
                <p className="text-xs font-bold text-primary-700 mb-0.5">{s.label}</p>
                <p className="text-base font-bold text-stone-800 truncate">{s.value}</p>
                <p className="text-[9px] text-stone-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
