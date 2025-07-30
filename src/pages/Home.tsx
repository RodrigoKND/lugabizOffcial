import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Plus, Eye } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import CategoryCard from '../components/CategoryCard';
import PlaceCard from '../components/PlaceCard';
import SearchInput from '../components/SearchInput';
import AllPlacesModal from '../components/AllPlacesModal';
import WelcomeMessage from '../components/WelcomeMessage';
import { Place } from '../types';

interface HomeProps {
  onAuthClick: () => void;
}

const Home: React.FC<HomeProps> = ({ onAuthClick }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTopPlaces, getRecentPlaces, categories } = usePlaces();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllPlacesModal, setShowAllPlacesModal] = useState(false);

  const topPlaces = getTopPlaces();
  const recentPlaces = getRecentPlaces();

  const handlePublishClick = () => {
    if (user) {
      navigate('/add-place');
    } else {
      onAuthClick();
    }
  };

  const handlePlaceSelect = (place: Place) => {
    navigate(`/place/${place.id}`);
  };

  return (
    <div className="relative min-h-screen bg-pink-50 overflow-hidden">
      <div className="absolute top-60 left-20 w-[200px] h-[200px] bg-rose-300 opacity-30 rounded-full z-0 " />
      <div className="absolute top-20 right-10 w-[250px] h-[250px] bg-purple-300 opacity-30 rounded-full z-0" />
      <div className="relative z-10">
        <WelcomeMessage />
        <AllPlacesModal
          isOpen={showAllPlacesModal}
          onClose={() => setShowAllPlacesModal(false)}
        />

        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-tomato text-white px-6 py-3 rounded-full mb-6"
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">Descubre lugares únicos</span>
              </div>

              <h1
                className="text-4xl md:text-6xl font-bold text-gray-900 mb-9"
              >
                Encuentra los mejores
                <span className="block bg-gradient-to-r from-primary-600 to-tomato bg-clip-text text-transparent">
                  lugares locales
                </span>
              </h1>

              <p
                className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              >
                Explora pequeños negocios, rincones escondidos y joyas locales recomendadas por la comunidad.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onPlaceSelect={handlePlaceSelect}
                />
                <button
                  onClick={handlePublishClick}
                  className="bg-gradient-to-r justify-center from-tomato to-red-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>{user ? 'Publicar lugar' : 'Iniciar sesión'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Categories Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="py-16 bg-white/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Explora por categorías</h2>
              <p className="text-gray-600">Encuentra exactamente lo que buscas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Featured Places */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="py-16 bg-white/50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-8 h-8 text-primary-500" />
                  <span>Más destacados por la comunidad</span>
                </h2>
                <p className="text-gray-600">Los lugares más guardados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topPlaces.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <PlaceCard
                    place={place}
                    onClick={() => navigate(`/place/${place.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Recent Places */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Lugares recientes</h2>
                <p className="text-gray-600">Los lugares más recientes publicados</p>
              </div>
              <button
                onClick={() => setShowAllPlacesModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-tomato text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                <Eye className="w-5 h-5" />
                <span>Ver todo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentPlaces.map((place, index) => (
                <motion.div
                  key={place.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <PlaceCard
                    place={place}
                    onClick={() => navigate(`/place/${place.id}`)}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;