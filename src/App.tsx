import { useState, useEffect, useCallback, lazy, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, PlacesProvider, useAuth } from '@presentation/context';
import { Navbar, Footer, AuthModal, ChatButton, ChatModal, SurveyCard, Preferences } from '@presentation/components/features';
import BannedAccountModal from '@presentation/components/features/users/modal/BannedAccountModal';
import { Home, PlaceDetail, AddPlace, Profile, EventDetailPage, EventFeedPage, EditEventPage, EditPlacePage, Confirmation, SharedPlacePage, CommunityPage } from '@presentation/pages';
import { useEventNotifications } from '@presentation/hooks/useEventNotifications';
import { usePushNotifications } from '@presentation/hooks/usePushNotifications';
import { usePendingsurveys } from '@presentation/hooks/useSurveys';
import { useUserTracking } from '@presentation/hooks/geo/useUserTracking';
import { marketSurveysService } from '@lib/supabase';

const AdminPanel = lazy(() => import('@presentation/pages/Admin/AdminPanel'));

// ── Scroll restoration for BrowserRouter (no data-router needed) ─────────────
function ScrollRestorer() {
  const { pathname, key } = useLocation();
  const navType = useNavigationType();

  useEffect(() => {
    if (navType === 'POP') {
      const saved = sessionStorage.getItem(`scroll:${pathname}:${key}`);
      if (saved) {
        requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, key, navType]);

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

function EventNotificationsManager() {
  useEventNotifications();
  usePushNotifications();
  useUserTracking();
  return null;
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
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatSearch = useCallback((query: string) => {
    console.log('Chat search:', query);
  }, []);

  const location = useLocation();
  // Background location is set when navigating to /place/:id from the feed
  // so the feed stays mounted underneath and the place slides up as a sheet
  const background = location.state?.background as typeof location | undefined;

  return (
    <>
      <ScrollRestorer />
      <EventNotificationsManager />
      <GlobalPreferences />
      <GlobalBanModal />

      <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
      <main className="min-h-screen flex flex-col w-full">
        <div className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            {/* When a background exists, render that page (keeps feed alive) */}
            <Routes location={background || location}>
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
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </div>
        <ChatButton onClick={() => setIsChatOpen(true)} isVisible />
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onSearch={handleChatSearch} />
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
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
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
