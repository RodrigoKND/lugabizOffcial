import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider, PlacesProvider } from '@presentation/context';
import { Navbar, Footer, AuthModal } from '@presentation/components/features';
import { Home, PlaceDetail, AddPlace, Profile, EventDetailPage, Confirmation } from '@presentation/pages';

const AdminPanel = lazy(() => import('@presentation/pages/Admin/AdminPanel'));

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
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
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/confirmation" element={<Confirmation />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Suspense>
            </div>
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
