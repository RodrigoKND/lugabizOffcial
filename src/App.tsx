import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/presentation/context/AuthContext';
import { PlacesProvider } from '@/presentation/context/PlacesContext';
import Navbar from '@/presentation/components/features/Navbar';
import Footer from '@/presentation/components/features/Footer';
import AuthModal from '@/presentation/components/features/AuthModal';
import Home from '@/presentation/pages/Home';
import PlaceDetail from '@/presentation/pages/PlaceDetail';
import AddPlace from '@/presentation/pages/AddPlace';
import Profile from '@/presentation/pages/Profile';
import Confirmation from '@/presentation/pages/Confirmation';
import Explore from '@/presentation/pages/Explore';
import EventDetailPage from '@/presentation/pages/EventDetailPage';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <PlacesProvider>
        <Router>
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
                <Route path="/explore" element={<Explore />} />
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
        </Router>
      </PlacesProvider>
      <Analytics mode='production' />
    </AuthProvider>
  );
}

export default App;