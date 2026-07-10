import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@lib/supabase/client';
import { adminService } from '@lib/supabase/services/admin/admin';
import { Loader2, RefreshCw } from 'lucide-react';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardGrowthBlock } from './DashboardGrowthBlock';
import { DashboardCategoryBlock } from './DashboardCategoryBlock';
import { DashboardOwnerBlock } from './DashboardOwnerBlock';
import { DashboardEngagementBlock } from './DashboardEngagementBlock';
import { RecentActivity } from './RecentActivity';
import type { DashboardData } from '../types';

function ok<T>(r: PromiseSettledResult<T>) { return r.status === 'fulfilled' ? r.value : null; }

export function DashboardSection() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pendingRefreshRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a, g, c, sg, o, e] = await Promise.allSettled([
        adminService.getStats(), adminService.getAdvancedStats(), adminService.getGrowthData(),
        adminService.getCategoryDistribution(), adminService.getSocialGroupsDistribution(),
        adminService.getBusinessOwnerActivity(), adminService.getUserEngagementMetrics(),
      ]);
      setData({ stats: ok(s), advanced: ok(a), growth: ok(g) ?? [], categories: ok(c) ?? [], socialGroups: ok(sg) ?? [], owners: ok(o) ?? [], engagement: ok(e) });
      setLastUpdated(new Date());
    } catch (err) { console.error('[DashboardSection:load]', err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const tables = ['users', 'places', 'events', 'reviews', 'notifications', 'user_activity', 'event_attendance'];
    const channels = tables.map(t => supabase.channel(`admin-rt-${t}`).on('postgres_changes', { event: '*', schema: 'public', table: t }, () => { pendingRefreshRef.current = true; }).subscribe());
    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, []);

  const refreshLive = useCallback(async () => {
    try {
      const [s, a, e] = await Promise.allSettled([adminService.getStats(), adminService.getAdvancedStats(), adminService.getUserEngagementMetrics()]);
      setData(p => p ? { ...p, stats: ok(s) ?? p.stats, advanced: ok(a) ?? p.advanced, engagement: ok(e) ?? p.engagement } : p);
      setLastUpdated(new Date());
    } catch (err) { console.error('[DashboardSection:refreshLive]', err); }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingRefreshRef.current) { pendingRefreshRef.current = false; refreshLive(); }
      else {
        adminService.getAdvancedStats().then(a => { setData(p => p ? { ...p, advanced: a } : p); setLastUpdated(new Date()); }).catch(() => {});
        adminService.getUserEngagementMetrics().then(e => { setData(p => p ? { ...p, engagement: e } : p); }).catch(() => {});
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [refreshLive]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-primary-200 animate-ping opacity-30" />
      </div>
      <p className="text-sm text-stone-400 font-medium">Cargando métricas del sistema...</p>
    </div>
  );

  const d = data || {};
  const stats = d.stats; const advanced = d.advanced; const growth = d.growth; const categories = d.categories; const socialGroups = d.socialGroups; const owners = d.owners; const engagement = d.engagement;
  const pieData = [
    { name: 'Usuarios', value: stats?.users ?? 0 }, { name: 'Lugares', value: stats?.places ?? 0 },
    { name: 'Eventos', value: stats?.events ?? 0 }, { name: 'Reseñas', value: stats?.reviews ?? 0 },
    { name: 'Encuestas', value: stats?.surveys ?? 0 }, { name: 'Notificaciones', value: stats?.notifications ?? 0 },
  ].filter(d => d.value > 0);
  const catBars = categories?.map(c => ({ name: c.name, value: c.total, color: c.color, sub: c.places })) ?? [];
  const sgBars = socialGroups?.map(sg => ({ name: sg.name, value: sg.total, color: sg.color })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Vista General</h2>
          {lastUpdated && <p className="text-[11px] text-stone-400 mt-0.5">Actualizado a las {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</p>}
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-all shadow-sm">
          <RefreshCw className="w-3.5 h-3.5" /> Actualizar
        </button>
      </div>
      <DashboardKpiCards stats={stats} advanced={advanced} />
      <DashboardGrowthBlock growth={growth ?? []} stats={stats} pieData={pieData} />
      <DashboardCategoryBlock catBars={catBars} sgBars={sgBars} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardOwnerBlock owners={owners ?? []} />
        <DashboardEngagementBlock engagement={engagement} advanced={advanced} />
      </div>
      <RecentActivity />
    </div>
  );
}
