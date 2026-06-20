import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, Link } from 'react-router-dom';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { supabase } from '@lib/supabase/client';
import {
  LayoutDashboard, MapPin, Calendar, MessageSquare, Users, Shield,
  Activity, AlertTriangle, Trash2, Ban, CheckCircle, Search,
  Bell, ArrowLeft, Loader2, X, Hash, Clock, UserX, UserCheck,
  ClipboardList, Flag, TrendingUp, Eye, Zap, Globe, BarChart2,
  RefreshCw, UserPlus, Store, Wifi, Database, Users2, ShieldAlert,
  BadgeCheck, Sparkles, FileText,
} from 'lucide-react';
import { getModerationLogs, markModerationLogReviewed, type ModerationLog } from '@lib/supabase/services/moderation/moderationService';
import { ownerVerificationService, type PendingVerification, ownerBusinessesService, type AdminOwnerBusiness } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { adminService } from '@lib/supabase/services/admin/admin';
import { reportsService } from '@lib/supabase/services/reports';
import { FlaggedContent } from '@domain/entities';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section = 'dashboard' | 'places' | 'events' | 'reviews' | 'users' | 'reports' | 'moderation' | 'verifications' | 'businesses' | 'system';

interface DashboardData {
  stats: { users: number; places: number; events: number; reviews: number; surveys: number; notifications: number } | null;
  advanced: { banned: number; owners: number; activeOwners: number; onlineUsers: number; surveysTotal: number } | null;
  growth: Array<{ month: string; users: number; places: number; events: number }>;
  categories: Array<{ name: string; color: string; places: number; events: number; total: number }>;
  socialGroups: Array<{ name: string; color: string; places: number; total: number }>;
  owners: Array<{ userId: string; name: string; avatar?: string; placesCount: number; eventsCount: number; lastActivity?: string; isActive: boolean }>;
  engagement: { avgSessionMinutes: number; topAction: string; dailyActiveUsers: number; weeklyActiveUsers: number } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  users: '#3b82f6',
  places: '#a855f7',
  events: '#10b981',
  reviews: '#8b5cf6',
  surveys: '#06b6d4',
  banned: '#ef4444',
  online: '#22c55e',
  owners: '#7c22ce',
};

const PIE_COLORS = ['#3b82f6', '#a855f7', '#10b981', '#8b5cf6', '#06b6d4', '#7c22ce', '#ec4899'];

const BAN_REASONS = [
  'Contenido inapropiado', 'Spam', 'Comportamiento abusivo', 'Información falsa',
  'Violación de términos', 'Suplantación de identidad', 'Publicaciones ofensivas', 'Otro',
];

const SIDEBAR_GROUPS = [
  { label: 'PRINCIPAL', items: [{ id: 'dashboard' as Section, label: 'Dashboard', icon: LayoutDashboard }] },
  {
    label: 'CONTENIDO',
    items: [
      { id: 'places' as Section, label: 'Lugares', icon: MapPin },
      { id: 'events' as Section, label: 'Eventos', icon: Calendar },
      { id: 'reviews' as Section, label: 'Reseñas', icon: MessageSquare },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { id: 'users' as Section, label: 'Usuarios', icon: Users },
      { id: 'reports' as Section, label: 'Reportes', icon: Flag },
      { id: 'moderation' as Section, label: 'Moderación IA', icon: ShieldAlert },
      { id: 'verifications' as Section, label: 'Verificaciones', icon: BadgeCheck },
      { id: 'businesses' as Section, label: 'Negocios', icon: Store },
      { id: 'system' as Section, label: 'Sistema', icon: Activity },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(d: string | Date) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'ahora';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  return `hace ${Math.floor(h / 24)}d`;
}

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return '';
  const parts: string[] = [`M ${pts[0][0]} ${pts[0][1]}`];
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1][0] + pts[i][0]) / 2;
    parts.push(`C ${cpx} ${pts[i - 1][1]}, ${cpx} ${pts[i][1]}, ${pts[i][0]} ${pts[i][1]}`);
  }
  return parts.join(' ');
}

// ─── Chart Components ─────────────────────────────────────────────────────────

function GrowthChart({ data }: { data: DashboardData['growth'] }) {
  if (!data.length) return (
    <div className="h-48 flex flex-col items-center justify-center text-stone-300 gap-2">
      <BarChart2 className="w-8 h-8" />
      <p className="text-xs">Sin datos de crecimiento aún</p>
    </div>
  );

  const W = 460, H = 160, PT = 12, PR = 8, PB = 28, PL = 36;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxVal = Math.max(...data.flatMap(d => [d.users, d.places, d.events]), 1);
  const n = data.length;

  const points = (key: 'users' | 'places' | 'events'): [number, number][] =>
    data.map((d, i) => [
      PL + (i / Math.max(n - 1, 1)) * cW,
      PT + cH - (d[key] / maxVal) * cH,
    ]);

  const areaPath = (key: 'users' | 'places' | 'events') => {
    const pts = points(key);
    return `${smoothPath(pts)} L ${PL + cW} ${PT + cH} L ${PL} ${PT + cH} Z`;
  };

  const gridVals = [0, Math.round(maxVal / 2), maxVal];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }}>
      {/* Grid */}
      {gridVals.map((v, i) => {
        const y = PT + cH - (v / maxVal) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} stroke="#f0f0f0" strokeWidth={1} />
            <text x={PL - 6} y={y + 3.5} textAnchor="end" fontSize={9} fill="#9ca3af">{v}</text>
          </g>
        );
      })}
      {/* Areas */}
      {(['users', 'places', 'events'] as const).map((k, idx) => (
        <path key={k} d={areaPath(k)} fill={[C.users, C.places, C.events][idx]} opacity={0.08} />
      ))}
      {/* Lines */}
      {(['users', 'places', 'events'] as const).map((k, idx) => (
        <path key={k} d={smoothPath(points(k))} fill="none"
          stroke={[C.users, C.places, C.events][idx]} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {/* Dots */}
      {(['users', 'places', 'events'] as const).map((k, idx) =>
        points(k).map(([x, y], i) => (
          <circle key={`${k}-${i}`} cx={x} cy={y} r={3}
            fill="white" stroke={[C.users, C.places, C.events][idx]} strokeWidth={1.5} />
        ))
      )}
      {/* X axis */}
      {data.map((d, i) => (
        <text key={i} x={PL + (i / Math.max(n - 1, 1)) * cW} y={H - 6}
          textAnchor="middle" fontSize={9.5} fill="#9ca3af">{d.month}</text>
      ))}
    </svg>
  );
}

function DonutChart({ data }: { data: Array<{ name: string; value: number }> }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) return (
    <div className="w-32 h-32 flex items-center justify-center text-stone-300">
      <Hash className="w-8 h-8" />
    </div>
  );

  const r = 42, cx = 56, cy = 56;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;

  return (
    <svg viewBox="0 0 112 112" className="w-32 h-32">
      {data.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circ - 1.5;
        const offset = -(cumPct * circ);
        cumPct += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={16}
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${cx} ${cy})`} />
        );
      })}
      <circle cx={cx} cy={cy} r={28} fill="white" />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fontWeight="700" fill="#1c1917">
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize={8} fill="#9ca3af">total</text>
    </svg>
  );
}

function HorizontalBars({ items, maxColor }: {
  items: Array<{ name: string; value: number; color?: string; sub?: number }>;
  maxColor?: string;
}) {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-stone-600 truncate max-w-[140px]">{item.name}</span>
            <span className="text-xs font-bold text-stone-800 ml-2 tabular-nums">{item.value}</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
              className="h-2 rounded-full"
              style={{ backgroundColor: item.color || maxColor || C.places }}
            />
          </div>
          {item.sub !== undefined && (
            <div className="flex gap-3 mt-1">
              <span className="text-[9px] text-stone-400">Lugares: {item.sub}</span>
              <span className="text-[9px] text-stone-400">Eventos: {item.value - (item.sub || 0)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminPanel: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  useSEO({ title: 'Panel de Administración', description: 'Dashboard administrativo de Lugabiz' });
  if (authLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return <AdminDashboard />;
};

// ─── Layout ───────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [section, setSection] = useState<Section>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentItem = SIDEBAR_GROUPS.flatMap(g => g.items).find(i => i.id === section);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col
        transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div>
                <p className="text-sm font-bold text-white leading-none">Lugabiz</p>
                <p className="text-[9px] text-primary-400/80 font-semibold uppercase tracking-widest mt-0.5">Admin Panel</p>
              </div>
            </Link>
            <button onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {SIDEBAR_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = section === item.id;
                  return (
                    <button key={item.id}
                      onClick={() => { setSection(item.id); setMobileOpen(false); }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${active
                          ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20'
                          : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }
                      `}>
                      <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-primary-400' : ''}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-700/50 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-500">Sistema operativo</span>
          </div>
          <Link to="/profile"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-all text-xs font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al perfil
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" />
      )}

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 lg:px-8 py-3.5 flex items-center gap-4 shadow-sm">
          <button onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-stone-800">{currentItem?.label}</h1>
            <p className="text-[10px] text-stone-400 font-medium">Panel de Administración · Lugabiz</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-200/80">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-green-600">En vivo</span>
            </div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={section}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}>
              {section === 'dashboard' && <DashboardSection />}
              {section === 'places' && <ModerationSection type="places" />}
              {section === 'events' && <ModerationSection type="events" />}
              {section === 'reviews' && <ModerationSection type="reviews" />}
              {section === 'users' && <UsersSection />}
              {section === 'reports' && <FlaggedContentSection />}
              {section === 'moderation' && <AIModerationSection />}
              {section === 'verifications' && <VerificationsSection />}
              {section === 'businesses' && <BusinessesSection />}
              {section === 'system' && <SystemSection />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard Section ────────────────────────────────────────────────────────

function DashboardSection() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const pendingRefreshRef = useRef(false);

  // Full reload (first mount + manual refresh)
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, advRes, growthRes, catRes, sgRes, ownRes, engRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getAdvancedStats(),
        adminService.getGrowthData(),
        adminService.getCategoryDistribution(),
        adminService.getSocialGroupsDistribution(),
        adminService.getBusinessOwnerActivity(),
        adminService.getUserEngagementMetrics(),
      ]);
      setData({
        stats: statsRes.status === 'fulfilled' ? statsRes.value : null,
        advanced: advRes.status === 'fulfilled' ? advRes.value : null,
        growth: growthRes.status === 'fulfilled' ? growthRes.value : [],
        categories: catRes.status === 'fulfilled' ? catRes.value : [],
        socialGroups: sgRes.status === 'fulfilled' ? sgRes.value : [],
        owners: ownRes.status === 'fulfilled' ? ownRes.value : [],
        engagement: engRes.status === 'fulfilled' ? engRes.value : null,
      });
      setLastUpdated(new Date());
    } catch { /* silently handled per-request above */ }
    finally { setLoading(false); }
  }, []);

  // Lightweight refresh: only stats + advanced + engagement (fast queries)
  const refreshLive = useCallback(async () => {
    try {
      const [statsRes, advRes, engRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getAdvancedStats(),
        adminService.getUserEngagementMetrics(),
      ]);
      setData(prev => prev ? {
        ...prev,
        stats: statsRes.status === 'fulfilled' ? statsRes.value : prev.stats,
        advanced: advRes.status === 'fulfilled' ? advRes.value : prev.advanced,
        engagement: engRes.status === 'fulfilled' ? engRes.value : prev.engagement,
      } : prev);
      setLastUpdated(new Date());
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime: subscribe to table changes and mark as needing refresh
  useEffect(() => {
    const tables = ['users', 'places', 'events', 'reviews', 'notifications', 'user_activity', 'event_attendance'];
    const channels = tables.map(table =>
      supabase
        .channel(`admin-rt-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          pendingRefreshRef.current = true;
        })
        .subscribe()
    );
    return () => { channels.forEach(ch => supabase.removeChannel(ch)); };
  }, []);

  // Poll every 15 s — refresh if realtime flagged a change, or always for time-based metrics
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        refreshLive();
      } else {
        // Refresh engagement (online users, DAU/WAU) on every tick regardless
        adminService.getAdvancedStats().then(advanced => {
          setData(prev => prev ? { ...prev, advanced } : prev);
          setLastUpdated(new Date());
        }).catch(() => {});
        adminService.getUserEngagementMetrics().then(engagement => {
          setData(prev => prev ? { ...prev, engagement } : prev);
        }).catch(() => {});
      }
    }, 15_000);
    return () => clearInterval(interval);
  }, [refreshLive]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-primary-200 animate-ping opacity-30" />
      </div>
      <p className="text-sm text-stone-400 font-medium">Cargando métricas del sistema...</p>
    </div>
  );

  const { stats, advanced, growth, categories, socialGroups, owners, engagement } = data || {};

  // KPI cards
  const kpis = [
    { label: 'Total Usuarios', value: stats?.users ?? 0, icon: Users, bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', desc: 'registrados' },
    { label: 'Online Ahora', value: advanced?.onlineUsers ?? 0, icon: Wifi, bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', desc: 'últ. 10 min' },
    { label: 'Baneados', value: advanced?.banned ?? 0, icon: Ban, bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600', desc: 'suspendidos' },
    { label: 'Dueños', value: advanced?.owners ?? 0, icon: Store, bg: 'bg-primary-500', light: 'bg-primary-50', text: 'text-primary-600', desc: `${advanced?.activeOwners ?? 0} activos` },
    { label: 'Lugares', value: stats?.places ?? 0, icon: MapPin, bg: 'bg-primary-500', light: 'bg-primary-50', text: 'text-primary-600', desc: 'publicados' },
    { label: 'Eventos', value: stats?.events ?? 0, icon: Calendar, bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', desc: 'creados' },
    { label: 'Reseñas', value: stats?.reviews ?? 0, icon: MessageSquare, bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-600', desc: 'escritas' },
    { label: 'Encuestas', value: advanced?.surveysTotal ?? stats?.surveys ?? 0, icon: ClipboardList, bg: 'bg-cyan-500', light: 'bg-cyan-50', text: 'text-cyan-600', desc: 'de mercado' },
  ];

  const pieData = [
    { name: 'Usuarios', value: stats?.users ?? 0 },
    { name: 'Lugares', value: stats?.places ?? 0 },
    { name: 'Eventos', value: stats?.events ?? 0 },
    { name: 'Reseñas', value: stats?.reviews ?? 0 },
    { name: 'Encuestas', value: stats?.surveys ?? 0 },
    { name: 'Notificaciones', value: stats?.notifications ?? 0 },
  ].filter(d => d.value > 0);

  const catBars = categories?.map(c => ({ name: c.name, value: c.total, color: c.color, sub: c.places })) ?? [];
  const sgBars = socialGroups?.map(sg => ({ name: sg.name, value: sg.total, color: sg.color })) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Vista General</h2>
          {lastUpdated && (
            <p className="text-[11px] text-stone-400 mt-0.5">
              Actualizado a las {lastUpdated.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 hover:border-primary-300 hover:text-primary-600 transition-all shadow-sm">
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${k.light}`}>
              <k.icon className={`w-4 h-4 ${k.text}`} />
            </div>
            <p className="text-2xl font-bold text-stone-800 leading-none tabular-nums">
              {k.value.toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-stone-700 mt-1.5 leading-tight">{k.label}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{k.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Growth Chart + Donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Crecimiento del Sistema</h3>
              <p className="text-[10px] text-stone-400">Nuevos registros por mes · últimos 6 meses</p>
            </div>
          </div>
          <GrowthChart data={growth ?? []} />
          <div className="flex items-center gap-5 mt-4 pt-4 border-t border-stone-50">
            {[
              { color: C.users, label: 'Usuarios' },
              { color: C.places, label: 'Lugares' },
              { color: C.events, label: 'Eventos' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-4 h-1.5 rounded-full" style={{ backgroundColor: l.color }} />
                <span className="text-[10px] text-stone-500 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Hash className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Distribución</h3>
              <p className="text-[10px] text-stone-400">Contenido total</p>
            </div>
          </div>
          <div className="flex justify-center mb-3">
            <DonutChart data={pieData} />
          </div>
          <div className="space-y-1.5">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[10px] text-stone-500">{d.name}</span>
                </div>
                <span className="text-[10px] font-bold text-stone-700 tabular-nums">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Demand + Social Groups ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Categorías más Demandadas</h3>
              <p className="text-[10px] text-stone-400">Lugares + eventos por categoría</p>
            </div>
          </div>
          {catBars.length > 0 ? (
            <HorizontalBars items={catBars} maxColor={C.places} />
          ) : (
            <div className="py-10 text-center">
              <BarChart2 className="w-8 h-8 text-stone-200 mx-auto mb-2" />
              <p className="text-xs text-stone-400">Sin datos de categorías</p>
            </div>
          )}
        </div>

        {/* Social Groups */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users2 className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Grupos Familiares Populares</h3>
              <p className="text-[10px] text-stone-400">Más publicados en lugares</p>
            </div>
          </div>
          {sgBars.length > 0 ? (
            <HorizontalBars items={sgBars} />
          ) : (
            <div className="py-10 text-center">
              <Users2 className="w-8 h-8 text-stone-200 mx-auto mb-2" />
              <p className="text-xs text-stone-400">Sin datos de grupos familiares</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Business Owners + Engagement ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Owners */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
              <Store className="w-4 h-4 text-primary-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-stone-800">Dueños de Negocio</h3>
              <p className="text-[10px] text-stone-400">Actividad en los últimos 30 días</p>
            </div>
            <div className="flex gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">
                {(owners ?? []).filter(o => o.isActive).length} activos
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-bold">
                {(owners ?? []).filter(o => !o.isActive).length} inactivos
              </span>
            </div>
          </div>
          {!(owners?.length) ? (
            <p className="text-sm text-stone-400 text-center py-8">Sin dueños registrados</p>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {owners!.map(owner => (
                <div key={owner.userId}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-stone-100 overflow-hidden shrink-0 ring-2 ring-stone-200">
                    {owner.avatar
                      ? <img src={owner.avatar} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Store className="w-3.5 h-3.5 text-stone-400" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-stone-700 truncate">{owner.name}</p>
                    <p className="text-[10px] text-stone-400">
                      {owner.placesCount} lugares · {owner.eventsCount} eventos
                      {owner.lastActivity && ` · ${timeAgo(owner.lastActivity)}`}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${owner.isActive ? 'bg-green-400' : 'bg-stone-300'}`}
                    title={owner.isActive ? 'Activo (30d)' : 'Inactivo'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <Activity className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Métricas de Engagement</h3>
              <p className="text-[10px] text-stone-400">Comportamiento de usuarios</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Usuarios / Día', value: engagement?.dailyActiveUsers ?? 0, unit: 'DAU', icon: UserPlus, bg: 'bg-blue-50', color: 'text-blue-600' },
              { label: 'Usuarios / Sem', value: engagement?.weeklyActiveUsers ?? 0, unit: 'WAU', icon: Users, bg: 'bg-violet-50', color: 'text-violet-600' },
              { label: 'Sesión Promedio', value: engagement?.avgSessionMinutes ?? 0, unit: 'min', icon: Clock, bg: 'bg-teal-50', color: 'text-teal-600' },
              { label: 'Acción Top', value: engagement?.topAction ?? '—', unit: '', icon: Eye, bg: 'bg-primary-50', color: 'text-primary-600' },
            ].map((m, i) => (
              <div key={i} className={`${m.bg} rounded-xl p-3.5`}>
                <m.icon className={`w-4 h-4 ${m.color} mb-2`} />
                <p className="text-base font-bold text-stone-800 truncate leading-none">
                  {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                  {m.unit && <span className="text-[10px] font-normal text-stone-500 ml-1">{m.unit}</span>}
                </p>
                <p className="text-[10px] text-stone-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Online indicator */}
          <div className="mt-3 p-3 bg-green-50 border border-green-200/80 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-green-700">
                {advanced?.onlineUsers ?? 0} usuario{(advanced?.onlineUsers ?? 0) !== 1 ? 's' : ''} en línea ahora
              </p>
              <p className="text-[10px] text-green-600">Actividad en los últimos 10 minutos</p>
            </div>
            <Wifi className="w-4 h-4 text-green-500 shrink-0" />
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <RecentActivity />
    </div>
  );
}

// ─── Recent Activity ──────────────────────────────────────────────────────────

function RecentActivity() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getRecentActivity()
      .then(setActivities)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="p-5 border-b border-stone-50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
          <Activity className="w-4 h-4 text-stone-500" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-stone-800">Actividad Reciente</h3>
          <p className="text-[10px] text-stone-400">Últimas acciones del sistema</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-10">Sin actividad reciente</p>
      ) : (
        <div className="divide-y divide-stone-50 max-h-72 overflow-y-auto">
          {activities.map((a: any, i: number) => (
            <div key={a.id || i}
              className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50 transition-colors">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-stone-700 truncate">{a.action || a.title || 'Actividad'}</p>
                {a.body && <p className="text-[10px] text-stone-400 truncate">{a.body}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="w-2.5 h-2.5 text-stone-300" />
                <span className="text-[10px] text-stone-400">{timeAgo(a.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Moderation Section ───────────────────────────────────────────────────────

function ModerationSection({ type }: { type: 'places' | 'events' | 'reviews' }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      let data: any[];
      if (type === 'places') data = await adminService.getAllPlaces();
      else if (type === 'events') data = await adminService.getAllEvents();
      else data = await adminService.getAllReviews();
      setItems(data);
    } catch { toast.error('Error al cargar datos'); }
    finally { setLoading(false); }
  }, [type]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      if (type === 'places') await adminService.deletePlace(id);
      else if (type === 'events') await adminService.deleteEvent(id);
      else await adminService.deleteReview(id);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Contenido eliminado');
    } catch { toast.error('Error al eliminar'); }
    finally { setDeleting(null); }
  };

  const filtered = items.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (i.name || i.title || i.comment || '').toLowerCase().includes(q);
  });

  const labels = { places: 'Lugares', events: 'Eventos', reviews: 'Reseñas' };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Buscar en ${labels[type]}...`}
            className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10" />
        </div>
        <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
          <span className="px-2.5 py-1 bg-stone-100 rounded-full">{filtered.length} / {items.length}</span>
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <Shield className="w-10 h-10 mx-auto mb-3 text-stone-200" />
          <p className="text-sm font-medium">No hay {labels[type].toLowerCase()} para mostrar</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
          {filtered.map((item: any) => (
            type === 'places' ? (
              /* ── Rich card for places ── */
              <div key={item.id} className="flex gap-4 px-5 py-4 hover:bg-stone-50 transition-colors">
                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{item.name || 'Sin nombre'}</p>
                  {item.description && (
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Author */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-stone-200 overflow-hidden shrink-0">
                        {item.user_avatar ? (
                          <img src={item.user_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-2.5 h-2.5 text-stone-400" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-stone-600">{item.user_name || 'Usuario'}</span>
                    </div>
                    <span className="text-stone-300 text-[10px]">·</span>
                    <div className="flex items-center gap-1 text-[11px] text-stone-400">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleString('es', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                {/* Delete */}
                <button onClick={() => setConfirmDeleteId(item.id)} disabled={deleting === item.id}
                  className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50 shrink-0 self-start mt-1">
                  {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ) : (
              /* ── Compact row for events & reviews ── */
              <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 truncate">
                    {item.name || item.title || (item.comment?.slice(0, 60) + '…') || 'Sin título'}
                  </p>
                  <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {timeAgo(item.created_at)}
                    {item.user_name && <><span>·</span>{item.user_name}</>}
                    {item.rating && <><span>·</span>★ {item.rating}</>}
                  </p>
                </div>
                <button onClick={() => setConfirmDeleteId(item.id)} disabled={deleting === item.id}
                  className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                  {deleting === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            )
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => { if (confirmDeleteId) handleDelete(confirmDeleteId); }}
        title="Eliminar contenido"
        message="¿Eliminar este contenido? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}

// ─── Users Section ────────────────────────────────────────────────────────────

function UsersSection() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [banning, setBanning] = useState<string | null>(null);
  const [banModal, setBanModal] = useState<{ id: string; name: string } | null>(null);
  const [banReason, setBanReason] = useState('');
  const [confirmUnbanId, setConfirmUnbanId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try { setUsers(await adminService.getUsers()); }
    catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleBan = async () => {
    if (!banModal || !banReason) return;
    setBanning(banModal.id);
    try {
      await adminService.banUser(banModal.id, banReason);
      setUsers(prev => prev.map(u => u.id === banModal.id ? { ...u, banned: true, ban_reason: banReason } : u));
      toast.success(`Usuario baneado`);
      setBanModal(null);
      setBanReason('');
    } catch { toast.error('Error al banear usuario'); }
    finally { setBanning(null); }
  };

  const handleUnban = async (userId: string) => {
    try {
      await adminService.unbanUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, banned: false, ban_reason: null } : u));
      toast.success('Usuario restaurado');
    } catch { toast.error('Error al restaurar usuario'); }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  const banned = users.filter(u => u.banned).length;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  return (
    <>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Total', value: users.length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Activos', value: users.length - banned, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Baneados', value: banned, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/10" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Users className="w-10 h-10 mx-auto mb-3 text-stone-200" />
            <p className="text-sm font-medium">No hay usuarios para mostrar</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
            {filtered.map((u: any) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-stone-100 overflow-hidden shrink-0 ring-2 ring-stone-200">
                  {u.avatar
                    ? <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Users className="w-4 h-4 text-stone-400" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-medium text-stone-700 truncate">{u.name}</p>
                    {u.banned && (
                      <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">BANEADO</span>
                    )}
                    {u.role === 'admin' && (
                      <span className="text-[9px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">Admin</span>
                    )}
                    {u.role === 'owner' && (
                      <span className="text-[9px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">Dueño</span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">{u.email}</p>
                  {u.banned && u.ban_reason && (
                    <p className="text-[10px] text-red-400 mt-0.5">Motivo: {u.ban_reason}</p>
                  )}
                </div>
                <div className="flex items-center">
                  {u.banned ? (
                    <button onClick={() => setConfirmUnbanId(u.id)}
                      className="p-2 rounded-xl text-stone-400 hover:text-green-500 hover:bg-green-50 transition-all"
                      title="Restaurar usuario">
                      <UserCheck className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => setBanModal({ id: u.id, name: u.name })}
                      className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Banear usuario">
                      <Ban className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmUnbanId}
        onClose={() => setConfirmUnbanId(null)}
        onConfirm={() => { if (confirmUnbanId) handleUnban(confirmUnbanId); }}
        title="Restaurar usuario"
        message="¿Restaurar el acceso de este usuario? Podrá iniciar sesión nuevamente."
        confirmLabel="Restaurar"
        variant="warning"
      />

      {/* Ban Modal */}
      <AnimatePresence>
        {banModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setBanModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800">Banear usuario</h3>
                  <p className="text-xs text-stone-400">{banModal.name}</p>
                </div>
                <button onClick={() => setBanModal(null)} className="ml-auto p-1.5 hover:bg-stone-100 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2 block">Motivo de suspensión</label>
              <select value={banReason} onChange={e => setBanReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 mb-4">
                <option value="">Seleccionar motivo...</option>
                {BAN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <div className="bg-primary-50 border border-primary-200/80 rounded-xl p-3 mb-5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-primary-700">
                    El usuario recibirá una notificación informando el motivo de la suspensión.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setBanModal(null)}
                  className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl text-sm font-semibold hover:bg-stone-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={handleBan} disabled={!banReason || banning === banModal.id}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {banning === banModal.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                  Banear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Flagged Content Section ──────────────────────────────────────────────────

function FlaggedContentSection() {
  const [flagged, setFlagged] = useState<FlaggedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [banning, setBanning] = useState<string | null>(null);
  const [confirmBanItem, setConfirmBanItem] = useState<FlaggedContent | null>(null);

  const loadFlagged = useCallback(async () => {
    setLoading(true);
    try { setFlagged(await reportsService.getFlaggedContent()); }
    catch { toast.error('Error al cargar reportes'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadFlagged(); }, [loadFlagged]);

  const handleBanFromContent = async (item: FlaggedContent) => {
    setBanning(item.authorId);
    try {
      await adminService.banUserFromContent(item.authorId, item.latestReason, {
        targetId: item.targetId,
        targetType: item.targetType,
        content: item.content,
      });
      setFlagged(prev => prev.filter(f => f.targetId !== item.targetId));
      toast.success(`Usuario baneado: ${item.authorName}`);
    } catch { toast.error('Error al banear'); }
    finally { setBanning(null); }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="p-5 border-b border-stone-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
          <Flag className="w-4 h-4 text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-stone-800">Contenido Reportado</h3>
          <p className="text-[11px] text-stone-400">{flagged.length} elemento{flagged.length !== 1 ? 's' : ''} con {reportsService.REPORT_THRESHOLD}+ reportes</p>
        </div>
      </div>
      {flagged.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-200" />
          <p className="text-sm font-medium text-stone-500">No hay contenido reportado</p>
          <p className="text-xs text-stone-400 mt-1">Todo está bajo control</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
          {flagged.map((item) => (
            <div key={item.targetId} className="flex items-start gap-3 px-5 py-4 hover:bg-stone-50 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Flag className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-700">{item.authorName}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.reportCount >= 5 ? 'bg-red-100 text-red-600' : 'bg-primary-100 text-primary-600'}`}>
                    {item.reportCount} reportes
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{item.content}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-red-400 font-medium">Último: {item.latestReason}</span>
                  <span className="text-[10px] text-stone-300">·</span>
                  <span className="text-[10px] text-stone-400 capitalize">{item.targetType === 'review' ? 'Reseña' : 'Comentario'}</span>
                </div>
              </div>
              <button onClick={() => setConfirmBanItem(item)} disabled={banning === item.authorId}
                className="p-2 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 disabled:opacity-50"
                title="Banear usuario">
                {banning === item.authorId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmBanItem}
        onClose={() => setConfirmBanItem(null)}
        onConfirm={() => { if (confirmBanItem) handleBanFromContent(confirmBanItem); }}
        title="Banear usuario"
        message={confirmBanItem ? `¿Banear a ${confirmBanItem.authorName} por "${confirmBanItem.latestReason}"?` : ''}
        confirmLabel="Banear"
        variant="danger"
      />
    </div>
  );
}

// ─── System Section ───────────────────────────────────────────────────────────

function SystemSection() {
  const [stats, setStats] = useState<any>(null);
  const [engagement, setEngagement] = useState<any>(null);
  const [dbStatus, setDbStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAll = async () => {
      setLoading(true);
      const [statsRes, engRes] = await Promise.allSettled([
        adminService.getStats(),
        adminService.getUserEngagementMetrics(),
      ]);
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
        setDbStatus('ok');
      } else {
        setDbStatus('error');
      }
      if (engRes.status === 'fulfilled') setEngagement(engRes.value);
      setLoading(false);
    };
    checkAll();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>;

  const services = [
    { icon: Globe, label: 'Aplicación Web', desc: 'Interfaz principal operativa', status: 'ok' as const },
    { icon: Database, label: 'Base de Datos', desc: dbStatus === 'ok' ? 'Conexión Supabase estable' : 'Error de conexión', status: dbStatus },
    { icon: Shield, label: 'Autenticación', desc: 'JWT y sesiones funcionando', status: 'ok' as const },
    { icon: Bell, label: 'Notificaciones', desc: 'Edge Functions activas', status: 'ok' as const },
  ];

  const metrics = [
    { label: 'Usuarios registrados', value: stats?.users ?? 0 },
    { label: 'Lugares publicados', value: stats?.places ?? 0 },
    { label: 'Eventos creados', value: stats?.events ?? 0 },
    { label: 'Reseñas escritas', value: stats?.reviews ?? 0 },
    { label: 'Encuestas activas', value: stats?.surveys ?? 0 },
    { label: 'Notificaciones enviadas', value: stats?.notifications ?? 0 },
    { label: 'Usuarios activos / día', value: engagement?.dailyActiveUsers ?? 0 },
    { label: 'Usuarios activos / semana', value: engagement?.weeklyActiveUsers ?? 0 },
    { label: 'Sesión promedio (min)', value: engagement?.avgSessionMinutes ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Service Status */}
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
            <Activity className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800">Estado del Sistema</h3>
            <p className="text-[10px] text-stone-400">Servicios en tiempo real</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-green-600">Operativo</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map(s => (
            <div key={s.label} className={`flex items-center gap-3 p-4 rounded-xl border ${
              s.status === 'ok' ? 'bg-green-50/50 border-green-200/50' :
              s.status === 'error' ? 'bg-red-50 border-red-200/50' :
              'bg-stone-50 border-stone-200/50'
            }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                s.status === 'ok' ? 'bg-green-100' : s.status === 'error' ? 'bg-red-100' : 'bg-stone-100'
              }`}>
                <s.icon className={`w-4 h-4 ${
                  s.status === 'ok' ? 'text-green-600' : s.status === 'error' ? 'text-red-500' : 'text-stone-400'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-700">{s.label}</p>
                <p className={`text-xs ${s.status === 'ok' ? 'text-green-600' : s.status === 'error' ? 'text-red-500' : 'text-stone-400'}`}>
                  {s.desc}
                </p>
              </div>
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                s.status === 'ok' ? 'bg-green-400' : s.status === 'error' ? 'bg-red-400' : 'bg-stone-300 animate-pulse'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Global Metrics */}
      <div className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-800">Métricas Globales</h3>
            <p className="text-[10px] text-stone-400">Resumen completo del sistema</p>
          </div>
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

      {/* Engagement summary */}
      {engagement && (
        <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 rounded-2xl p-6 border border-primary-200/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-800">Resumen de Actividad</h3>
              <p className="text-[10px] text-stone-500">Tiempo de respuesta e interacción promedio</p>
            </div>
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

// ─── AI Moderation Section ────────────────────────────────────────────────────

const CONTENT_TYPE_LABELS: Record<string, string> = {
  place: 'Lugar',
  event: 'Evento',
  post: 'Post de negocio',
  survey: 'Encuesta',
  announcement: 'Anuncio',
};

function AIModerationSection() {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try { setLogs(await getModerationLogs()); }
    catch { toast.error('Error al cargar logs de moderación'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const handleMarkReviewed = async (id: string) => {
    setReviewing(id);
    try {
      await markModerationLogReviewed(id);
      setLogs(prev => prev.map(l => l.id === id ? { ...l, reviewed: true } : l));
    } catch { toast.error('Error al marcar como revisado'); }
    finally { setReviewing(null); }
  };

  const pending = logs.filter(l => !l.reviewed);
  const reviewed = logs.filter(l => l.reviewed);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total detectados', value: logs.length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Pendientes de revisión', value: pending.length, color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Revisados', value: reviewed.length, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-800">Intentos de contenido inapropiado</h3>
            <p className="text-[11px] text-stone-400">Detectados automáticamente por IA</p>
          </div>
          <button onClick={loadLogs}
            className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-200" />
            <p className="text-sm font-medium text-stone-500">Sin contenido inapropiado detectado</p>
            <p className="text-xs text-stone-400 mt-1">La comunidad está siguiendo las normas</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50 max-h-[60vh] overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className={`flex items-start gap-3 px-5 py-4 hover:bg-stone-50 transition-colors ${log.reviewed ? 'opacity-50' : ''}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${log.reviewed ? 'bg-stone-100' : 'bg-red-50'}`}>
                  <ShieldAlert className={`w-4 h-4 ${log.reviewed ? 'text-stone-400' : 'text-red-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-stone-700">{log.userName}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      log.contentType === 'place' ? 'bg-primary-100 text-primary-700' :
                      log.contentType === 'event' ? 'bg-emerald-100 text-emerald-700' :
                      log.contentType === 'post' ? 'bg-blue-100 text-blue-700' :
                      log.contentType === 'survey' ? 'bg-violet-100 text-violet-700' :
                      'bg-primary-100 text-primary-700'
                    }`}>
                      {CONTENT_TYPE_LABELS[log.contentType] ?? log.contentType}
                    </span>
                    {log.reviewed && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500">
                        Revisado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mb-1 line-clamp-2 italic">"{log.contentText}"</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-500 font-medium">{log.reason}</span>
                    <span className="text-stone-300">·</span>
                    <Clock className="w-2.5 h-2.5 text-stone-300" />
                    <span className="text-[10px] text-stone-400">{timeAgo(log.createdAt.toISOString())}</span>
                  </div>
                </div>
                {!log.reviewed && (
                  <button
                    onClick={() => handleMarkReviewed(log.id)}
                    disabled={reviewing === log.id}
                    className="p-2 rounded-xl text-stone-400 hover:text-green-500 hover:bg-green-50 transition-all disabled:opacity-50 shrink-0"
                    title="Marcar como revisado"
                  >
                    {reviewing === log.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle className="w-4 h-4" />
                    }
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VerificationsSection() {
  const [items, setItems] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await ownerVerificationService.listPending()); }
    catch (e: any) { toast.error(e?.message ?? 'Error al cargar verificaciones'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (id: string, decision: 'approve' | 'reject') => {
    setActing(id);
    try {
      await ownerVerificationService.review(id, decision, notes[id]);
      setItems(prev => prev.filter(v => v.id !== id));
      toast.success(decision === 'approve' ? 'Verificación aprobada' : 'Verificación rechazada');
    } catch (e: any) { toast.error(e?.message ?? 'No se pudo procesar'); }
    finally { setActing(null); }
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
            <BadgeCheck className="w-4 h-4 text-primary-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-800">Solicitudes de verificación</h3>
            <p className="text-[11px] text-stone-400">Confirmá que hay una persona real detrás. No clasifiques estatus legal.</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-green-200" />
            <p className="text-sm font-medium text-stone-500">No hay solicitudes pendientes</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {items.map(v => (
              <div key={v.id} className="p-5 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-stone-700">{v.userName ?? v.userId}</span>
                  <span className="text-[11px] text-stone-400">{v.userEmail}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${v.kind === 'identity' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'}`}>
                    {v.kind === 'identity' ? (<><Sparkles className="w-3 h-3 inline -mt-0.5" /> Identidad</>) : (<><FileText className="w-3 h-3 inline -mt-0.5" /> Docs de negocio</>)}
                  </span>
                  <span className="text-stone-300">·</span>
                  <Clock className="w-2.5 h-2.5 text-stone-300" />
                  <span className="text-[10px] text-stone-400">{timeAgo(v.createdAt)}</span>
                </div>

                {v.businessName && <p className="text-xs text-stone-500">Negocio: <span className="font-medium text-stone-700">{v.businessName}</span></p>}
                {(v.extracted as any)?.claimedName && (
                  <p className="text-xs text-stone-500">
                    Nombre declarado: <span className="font-medium text-stone-700">{String((v.extracted as any).claimedName)}</span>
                    {(v.extracted as any)?.nameMatches === false && <span className="ml-1 text-red-500 font-semibold">(IA: no coincide)</span>}
                    {(v.extracted as any)?.nameMatches === true && <span className="ml-1 text-green-600 font-semibold">(IA: coincide)</span>}
                  </p>
                )}

                {/* Pre-análisis de IA (referencia, no decide) */}
                <div className="flex items-start gap-2 text-[11px] bg-stone-50 rounded-lg px-3 py-2">
                  <Zap className="w-3.5 h-3.5 text-primary-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-600">IA: </span>
                    {v.aiScore != null && <span className={`font-bold ${v.aiScore >= 0.7 ? 'text-green-600' : v.aiScore >= 0.4 ? 'text-primary-600' : 'text-red-600'}`}>{Math.round(v.aiScore * 100)}% </span>}
                    <span className="text-stone-500">{v.aiNotes ?? 'Sin análisis automático — revisá manualmente.'}</span>
                  </div>
                </div>

                {/* Documentos (URLs firmadas, expiran pronto) */}
                {v.docUrls.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {v.docUrls.map((u, i) => (
                      <a key={i} href={u} target="_blank" rel="noreferrer"
                        className="w-24 h-24 rounded-xl overflow-hidden border border-stone-200 hover:ring-2 hover:ring-primary-300 transition-all">
                        <img src={u} alt={`doc-${i}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                <input value={notes[v.id] ?? ''} onChange={e => setNotes(n => ({ ...n, [v.id]: e.target.value }))}
                  placeholder="Nota para el usuario (opcional, ej. motivo del rechazo)"
                  className="w-full text-xs border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-200" />

                <div className="flex gap-2">
                  <button onClick={() => decide(v.id, 'approve')} disabled={acting === v.id}
                    className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {acting === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Aprobar
                  </button>
                  <button onClick={() => decide(v.id, 'reject')} disabled={acting === v.id}
                    className="flex-1 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <X className="w-4 h-4" /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BusinessesSection() {
  const [items, setItems] = useState<AdminOwnerBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [target, setTarget] = useState<AdminOwnerBusiness | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await ownerBusinessesService.listAllForAdmin()); }
    catch (e: any) { toast.error(e?.message ?? 'Error al cargar negocios'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (biz: AdminOwnerBusiness) => {
    setActing(biz.id);
    try {
      await ownerBusinessesService.removeForAdmin(biz.id);
      setItems(prev => prev.filter(b => b.id !== biz.id));
      toast.success('Negocio eliminado');
    } catch (e: any) { toast.error(e?.message ?? 'No se pudo eliminar'); }
    finally { setActing(null); setTarget(null); }
  };

  // Agrupar por dueño
  const groups = items.reduce<Record<string, { name?: string; email?: string; list: AdminOwnerBusiness[] }>>((acc, b) => {
    (acc[b.userId] ??= { name: b.ownerName, email: b.ownerEmail, list: [] }).list.push(b);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 animate-spin text-primary-500" /></div>
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-stone-800">Negocios registrados</h3>
            <p className="text-[11px] text-stone-400">{items.length} negocio(s) · {Object.keys(groups).length} dueño(s)</p>
          </div>
          <button onClick={load} className="p-2 rounded-xl hover:bg-stone-100 transition-colors text-stone-400 hover:text-stone-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <Store className="w-10 h-10 mx-auto mb-3 text-stone-200" />
            <p className="text-sm font-medium text-stone-500">No hay negocios registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {Object.entries(groups).map(([uid, g]) => (
              <div key={uid} className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-stone-700">{g.name ?? uid}</span>
                  <span className="text-[11px] text-stone-400">{g.email}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700">{g.list.length}/3</span>
                </div>
                <div className="space-y-1.5">
                  {g.list.map(biz => (
                    <div key={biz.id} className="flex items-center gap-2 px-3 py-2 bg-stone-50 rounded-lg">
                      <Store className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="text-sm text-stone-700 flex-1 min-w-0 truncate">{biz.name}</span>
                      <button onClick={() => setTarget(biz)} disabled={acting === biz.id}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50">
                        {acting === biz.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={() => target && remove(target)}
        title="Eliminar negocio"
        message={`¿Eliminar "${target?.name}" de ${target?.ownerName ?? 'este dueño'}?`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
}

export default AdminPanel;
