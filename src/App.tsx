import { useState, useEffect, lazy, Suspense, useRef, createContext, useContext } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, PlacesProvider, useAuth } from '@presentation/context';
import { Navbar, Footer, AuthModal, ChatButton, SurveyCard, Preferences } from '@presentation/components/features';
import BannedAccountModal from '@presentation/components/features/users/modal/BannedAccountModal';
import { Home, PlaceDetail, AddPlace, Profile, EventDetailPage, EventFeedPage, EditEventPage, EditPlacePage, Confirmation, SharedPlacePage, CommunityPage, ChatPage, BusinessAdvisorPage } from '@presentation/pages';
import { useEventNotifications } from '@presentation/hooks/useEventNotifications';
import { usePushNotifications } from '@presentation/hooks/usePushNotifications';
import { usePendingsurveys } from '@presentation/hooks/useSurveys';
import { useUserTracking } from '@presentation/hooks/geo/useUserTracking';
import { marketSurveysService } from '@lib/supabase';

const AdminPanel = lazy(() => import('@presentation/pages/Admin/AdminPanel'));

// ── Scroll restoration for BrowserRouter (no data-router needed) ─────────────
function ScrollRestorer() {
  const { pathname, key, state } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') {
      const saved = sessionStorage.getItem(`scroll:${pathname}:${key}`);
      if (saved) {
        requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
        return;
      }
    }
    // Skip scroll reset when opening a modal sheet (background state present)
    if (!(state as any)?.background) {
      window.scrollTo(0, 0);
    }
  }, [pathname, key, navType, (state as any)?.background]);

  useEffect(() => {
    const save = () => sessionStorage.setItem(`scroll:${pathname}:${key}`, String(window.scrollY));
    window.addEventListener('beforeunload', save);
    return () => {
      save();
      window.removeEventListener('beforeunload', save);
    };
  }, [pathname, key]);

  return null;
}

// Contexto global para que cualquier componente pueda pedir "activar push"
const PushCtx = createContext<{ enable: () => Promise<boolean> }>({ enable: async () => false });
export const usePushEnable = () => useContext(PushCtx);

function EventNotificationsManager() {
  useEventNotifications();
  const { enablePushNotifications } = usePushNotifications();
  useUserTracking();
  return (
    <PushCtx.Provider value={{ enable: enablePushNotifications }}>
      <PushEnableBanner />
    </PushCtx.Provider>
  );
}

const PUSH_DIS_AT = '_lgz_push_dis_at';
const PUSH_DIS_CT = '_lgz_push_dis_ct';
// días de cooldown por número de veces que el usuario cerró el banner (índice = count)
const COOLDOWN_DAYS = [0, 3, 7, 14, 21];
const MAX_DISMISSALS = 5;

function getPushDismissCount(): number {
  try { return parseInt(localStorage.getItem(PUSH_DIS_CT) || '0', 10); } catch { return 0; }
}
function getPushDismissAt(): number {
  try { return parseInt(localStorage.getItem(PUSH_DIS_AT) || '0', 10); } catch { return 0; }
}
function recordPushDismiss() {
  try {
    const c = getPushDismissCount();
    localStorage.setItem(PUSH_DIS_CT, String(c + 1));
    localStorage.setItem(PUSH_DIS_AT, String(Date.now()));
  } catch {}
}

function PushEnableBanner() {
  const { user } = useAuth();
  const { enable } = usePushEnable();
  const [show, setShow] = useState(false);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !('PushManager' in window) || !('Notification' in window)) {
      setShow(false);
      return;
    }
    const perm = Notification.permission;
    if (perm === 'granted') { setShow(false); return; }

    if (perm === 'denied') {
      // Mostrar instrucciones de desbloqueo máximo 1x por semana
      const daysSince = (Date.now() - getPushDismissAt()) / 86_400_000;
      if (daysSince < 7) { setShow(false); return; }
      setDenied(true);
      const t = setTimeout(() => setShow(true), 30_000);
      return () => clearTimeout(t);
    }

    // permission === 'default'
    const count = getPushDismissCount();
    if (count >= MAX_DISMISSALS) { setShow(false); return; }
    const cooldown = COOLDOWN_DAYS[Math.min(count, COOLDOWN_DAYS.length - 1)];
    const daysSince = (Date.now() - getPushDismissAt()) / 86_400_000;
    if (getPushDismissAt() > 0 && daysSince < cooldown) { setShow(false); return; }

    const t = setTimeout(() => setShow(true), 30_000);
    return () => clearTimeout(t);
  }, [user]);

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    recordPushDismiss();
  };

  const handleEnable = async () => {
    setLoading(true);
    const ok = await enable();
    setLoading(false);
    if (ok) { setShow(false); return; }
    if (Notification.permission === 'denied') setDenied(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="push-banner"
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
        >
          {denied ? (
            <div className="bg-white border border-stone-200 rounded-2xl shadow-xl px-4 py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                <BellOff className="w-4 h-4 text-stone-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">Notificaciones bloqueadas</p>
                <p className="text-xs text-stone-500 mt-0.5 leading-snug">
                  Tocá el candado en la barra del navegador → <span className="font-medium">Notificaciones</span> → <span className="font-medium">Permitir</span>, y recargá la página.
                </p>
              </div>
              <button onClick={handleDismiss} className="shrink-0 text-stone-300 hover:text-stone-500 mt-0.5">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="bg-white border border-stone-100 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-800">Activá las notificaciones</p>
                <p className="text-xs text-stone-500 leading-snug">Enteráte de eventos y lugares aunque no estés en la app.</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleEnable}
                  disabled={loading}
                  className="px-3 py-1.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors disabled:opacity-60"
                >
                  {loading ? '...' : 'Activar'}
                </button>
                <button onClick={handleDismiss} className="text-stone-300 hover:text-stone-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PendingSurveys() {
  const location = useLocation();
  const { user } = useAuth();
  const { surveys, refresh } = usePendingsurveys();
  const [visible, setVisible] = useState<string | null>(null);

  useEffect(() => {
    if (surveys.length > 0 && !visible) {
      setVisible(surveys[0].id);
    }
  }, [surveys, visible]);

  if (location.pathname === '/' || surveys.length === 0) return null;

  const current = surveys.find(s => s.id === visible);
  if (!current) return null;

  return (
    <div className="fixed bottom-28 md:bottom-6 right-4 z-300 max-w-sm w-full">
      <SurveyCard
        survey={current}
        onClose={async () => {
          if (!user) return;
          try {
            const notifs = await marketSurveysService.getNotificationsForUser(user.id);
            const match = notifs.find((n: any) => n.survey_id === current.id);
            if (match) await marketSurveysService.markAsRead(match.id);
          } catch {}
          setVisible(null);
        }}
        onResponded={refresh}
      />
    </div>
  );
}

function GlobalPreferences() {
  const { showPreferences, setShowPreferences } = useAuth();
  return <Preferences openPreferences={showPreferences} setClosePreferences={setShowPreferences} />;
}

function GlobalBanModal() {
  const { banInfo, dismissBan } = useAuth();
  if (!banInfo) return null;
  return <BannedAccountModal reason={banInfo.reason} onDismiss={dismissBan} />;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ── Inner app — must live inside <Router> to access hooks ────────────────────
function AppRoutes() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const location = useLocation();
  // Background location is set when navigating to /place/:id from the feed
  // so the feed stays mounted underneath and the place slides up as a sheet
  const background = location.state?.background as typeof location | undefined;
  // Ubicación que realmente se pinta como "página" (cuando hay modal sheet de
  // lugar, debajo sigue la página de fondo). La transición se keyea por su
  // pathname: abrir/cerrar el sheet NO dispara transición de página (el sheet
  // tiene su propia animación), pero navegar entre páginas sí.
  const displayLocation = background || location;

  return (
    <>
      <ScrollRestorer />
      <EventNotificationsManager />
      <GlobalPreferences />
      <GlobalBanModal />

      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      <main className="min-h-screen flex flex-col w-full">
        <div className="flex-1">
          {/* Transición tipo Spotify entre páginas: crossfade rápido. Usamos SOLO
              opacity (sin transform) a propósito: muchos modales son `fixed inset-0`
              sin portal, y un transform persistente en este wrapper los atraparía
              (position:fixed quedaría relativo al wrapper). `mode="wait"` evita que
              dos páginas se solapen (y con ello que una "trague" clicks). */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={displayLocation.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                {/* When a background exists, render that page (keeps feed alive) */}
                <Routes location={displayLocation}>
                  <Route path="/" element={<Home />} />
                  <Route path="/place/:id" element={<PlaceDetail />} />
                  <Route path="/add-place" element={<AddPlace />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/event/:id" element={<EventDetailPage />} />
                  <Route path="/events/feed" element={<EventFeedPage />} />
                  <Route path="/edit-event/:id" element={<EditEventPage />} />
                  <Route path="/edit-place/:id" element={<EditPlacePage />} />
                  <Route path="/share/place/:shareId" element={<SharedPlacePage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/confirmation" element={<Confirmation />} />
                  <Route path="/comunidad" element={<CommunityPage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/asesor" element={<BusinessAdvisorPage />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
        <ChatButton isVisible />
        <PendingSurveys />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <Toaster position="top-right" toastOptions={{
          style: { borderRadius: '16px', padding: '12px 16px', fontSize: '14px' },
        }} />
      </main>
      <Footer />

      {/* Place detail modal sheet — slides up over the background page */}
      <AnimatePresence>
        {background && (
          <Suspense key="place-modal-suspense" fallback={null}>
            <Routes>
              <Route path="/place/:id" element={
                <motion.div
                  key="place-sheet"
                  initial={{ y: '100%' }}
                  animate={{ y: 0, pointerEvents: 'auto' }}
                  exit={{ y: '100%', pointerEvents: 'none' }}
                  transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.9 }}
                  className="fixed inset-0 z-[200] bg-[#FDFCFB] overflow-y-auto overscroll-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {/* Drag handle visual cue */}
                  <div className="sticky top-0 z-10 flex justify-center pt-2 pb-1 bg-[#FDFCFB]/90 backdrop-blur-sm">
                    <div className="w-10 h-1 rounded-full bg-stone-200" />
                  </div>
                  <PlaceDetail />
                </motion.div>
              } />
            </Routes>
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlacesProvider>
        <Router>
          <AppRoutes />
        </Router>
      </PlacesProvider>
      <Analytics mode="production" />
    </AuthProvider>
  );
}

export default App;
