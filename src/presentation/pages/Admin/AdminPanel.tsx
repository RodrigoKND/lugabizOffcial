import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigate, Link } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@presentation/context';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { SIDEBAR_GROUPS } from '@presentation/components/features/admin/constants';
import { DashboardSection } from '@presentation/components/features/admin/sections/DashboardSection';
import { PlacesSection } from '@presentation/components/features/admin/sections/PlacesSection';
import { EventsSection } from '@presentation/components/features/admin/sections/EventsSection';
import { ReviewsSection } from '@presentation/components/features/admin/sections/ReviewsSection';
import { UsersSection } from '@presentation/components/features/admin/sections/UsersSection';
import { ReportsSection } from '@presentation/components/features/admin/sections/ReportsSection';
import { ModerationSection } from '@presentation/components/features/admin/sections/ModerationSection';
import { VerificationsSection } from '@presentation/components/features/admin/sections/VerificationsSection';
import { BusinessesSection } from '@presentation/components/features/admin/sections/BusinessesSection';
import { MarketingSection } from '@presentation/components/features/admin/sections/MarketingSection';
import { SystemSection } from '@presentation/components/features/admin/sections/SystemSection';
import type { Section } from '@presentation/components/features/admin/types';

const SECTION_MAP: Record<Section, React.ComponentType> = {
  dashboard: DashboardSection,
  places: PlacesSection,
  events: EventsSection,
  reviews: ReviewsSection,
  users: UsersSection,
  reports: ReportsSection,
  moderation: ModerationSection,
  verifications: VerificationsSection,
  businesses: BusinessesSection,
  marketing: MarketingSection,
  system: SystemSection,
};

const AdminPanel: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  useSEO({ title: 'Panel de Administración', description: 'Dashboard administrativo de Lugabiz' });
  if (authLoading) return null;
  if (!user || !isAdmin) return <Navigate to="/" replace />;
  return <AdminDashboard />;
};

function AdminDashboard() {
  const [section, setSection] = useState<Section>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentItem = SIDEBAR_GROUPS.flatMap(g => g.items).find(i => i.id === section);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div><p className="text-sm font-bold text-white leading-none">Lugabiz</p><p className="text-[9px] text-primary-400/80 font-semibold uppercase tracking-widest mt-0.5">Admin Panel</p></div>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 hover:bg-slate-800 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {SIDEBAR_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = section === item.id;
                  return (
                    <button key={item.id} onClick={() => { setSection(item.id); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary-500/15 text-primary-300 border border-primary-500/20' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}`}>
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
        <div className="p-3 border-t border-slate-700/50 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2"><div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /><span className="text-xs text-slate-500">Sistema operativo</span></div>
          <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-all text-xs font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Volver al perfil</Link>
        </div>
      </aside>
      {mobileOpen && <div onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" />}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 px-4 lg:px-8 py-3.5 flex items-center gap-4 shadow-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 hover:bg-stone-100 rounded-xl transition-colors">
            <svg className="w-5 h-5 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
          <div><h1 className="text-base font-bold text-stone-800">{currentItem?.label}</h1><p className="text-[10px] text-stone-400 font-medium">Panel de Administración · Lugabiz</p></div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full border border-green-200/80">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] font-semibold text-green-600">En vivo</span></div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={section} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {(() => { const C = SECTION_MAP[section]; return C ? <C /> : null; })()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AdminPanel;
