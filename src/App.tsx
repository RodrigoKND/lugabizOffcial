import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, PlacesProvider, useAuth } from '@presentation/context';
import { Navbar, Footer, AuthModal, ChatButton, ChatModal, SurveyCard } from '@presentation/components/features';
import { Home, PlaceDetail, AddPlace, Profile, EventDetailPage, EventFeedPage, EditEventPage, EditPlacePage, Confirmation } from '@presentation/pages';
import { useEventNotifications } from '@presentation/hooks/useEventNotifications';
import { usePushNotifications } from '@presentation/hooks/usePushNotifications';
import { usePendingsurveys } from '@presentation/hooks/useSurveys';
import { marketSurveysService } from '@lib/supabase';

const AdminPanel = lazy(() => import('@presentation/pages/Admin/AdminPanel'));

function EventNotificationsManager() {
  useEventNotifications();
  usePushNotifications();
  return null;
}

function PendingSurveys() {
  const { user } = useAuth();
  const { surveys, refresh } = usePendingsurveys();
  const [visible, setVisible] = useState<string | null>(null);

  useEffect(() => {
    if (surveys.length > 0 && !visible) {
      setVisible(surveys[0].id);
    }
  }, [surveys, visible]);

  const current = surveys.find(s => s.id === visible);
  if (!current) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-300 max-w-sm w-full">
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

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatSearch = useCallback((query: string) => {
    console.log('Chat search:', query);
  }, []);

  return (
    <AuthProvider>
      <EventNotificationsManager />
      <Router>
        <PlacesProvider>
          <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
          <main className="min-h-screen flex flex-col w-full">
            <div className="flex-1">
              <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/place/:id" element={<PlaceDetail />} />
                  <Route path="/add-place" element={<AddPlace />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/event/:id" element={<EventDetailPage />} />
                  <Route path="/events/feed" element={<EventFeedPage />} />
                  <Route path="/edit-event/:id" element={<EditEventPage />} />
                  <Route path="/edit-place/:id" element={<EditPlacePage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/confirmation" element={<Confirmation />} />
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
        </PlacesProvider>
      </Router>
      <Analytics mode="production" />
    </AuthProvider>
  );
}

export default App;
