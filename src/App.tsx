import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { PlacesProvider } from '@/context/PlacesContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import Home from '@/pages/Home';
import PlaceDetail from '@/pages/PlaceDetail';
import AddPlace from '@/pages/AddPlace';
import Profile from '@/pages/Profile';
import CategoryPage from '@/pages/CategoryPage';
import Confirmation from '@/pages/Confirmation';
import Explore from '@/pages/Explore';
import EventDetailPage from '@/pages/EventDetailPage';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <AuthProvider>
      <PlacesProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar onAuthClick={() => setIsAuthModalOpen(true)} />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/place/:id" element={<PlaceDetail />} />
                <Route path="/add-place" element={<AddPlace />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/event/:id" element={<EventDetailPage />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
            <Footer />
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
            <Toaster position="top-right" />
          </div>
        </Router>
      </PlacesProvider>
      <Analytics mode='production' />
    </AuthProvider>
  );
}

export default App;