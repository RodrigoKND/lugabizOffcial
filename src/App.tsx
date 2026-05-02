import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from "@vercel/analytics/react"
import { AuthProvider, PlacesProvider } from '@presentation/context';
import { Navbar, Footer, AuthModal } from '@presentation/components/features';
import { Home, PlaceDetail, AddPlace, Profile, EventDetailPage, Confirmation } from '@presentation/pages';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <PlacesProvider>
          <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
          <main className="min-h-screen flex flex-col max-w-6xl mx-auto w-full">
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/place/:id" element={<PlaceDetail />} />
                <Route path="/add-place" element={<AddPlace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/event/:id" element={<EventDetailPage />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </div>
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
            <Toaster position="top-right" />
          </main>
          <Footer />
        </PlacesProvider>
      </Router>
      <Analytics mode='production' />
    </AuthProvider>
  );
}

export default App;