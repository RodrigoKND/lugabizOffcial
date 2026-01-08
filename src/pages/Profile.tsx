import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star, Palette, Plus, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlaces } from '@/context/PlacesContext';
import Preferences from '@/components/Preferences';
import PlaceCard from '@/components/PlaceCard';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, savedPlaces } = useAuth();
  const { places, getLengthPlacesByUserId, getLengthReviewsByUserId } = usePlaces();
  const [openPreferencesModal, setOpenPreferencesModal] = useState<boolean>(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const savedPlacesList = places.filter(place => savedPlaces.includes(place.id));
  const userPlaces = getLengthPlacesByUserId(user.id).length;
  const userReviews = getLengthReviewsByUserId(user.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link
            to="/"
            className="group inline-flex items-center space-x-2 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-4 mb-8">
          {/* Profile Info - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-12 lg:col-span-8 bg-gray-50 rounded-3xl p-8 border border-gray-100"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <img
                    src={user.avatar || '/avatar.png'}
                    alt={user.name}
                    className="w-28 h-28 rounded-2xl object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                    {user.name}
                  </h1>
                  <p className="text-gray-500 mb-4">{user.email}</p>
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full border border-gray-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Miembro desde {user.createdAt.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center flex-wrap gap-3">
              <button
                onClick={() => setOpenPreferencesModal(true)}
                className="flex items-center space-x-2 px-5 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-colors text-sm font-medium text-gray-700"
              >
                <Palette className="w-4 h-4" />
                <span>Gustos y preferencias</span>
              </button>

              <Link
                to="/add-place"
                className="flex items-center space-x-2 px-5 py-3 border border-purple-600 hover:border-purple-700 rounded-full transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Publicar lugar</span>
              </Link>

              <Link
                to="/"
className="flex items-center space-x-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                <span>Crear evento</span>
              </Link>
            </div>
          </motion.div>

          {/* Places Stat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-6 lg:col-span-2 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border border-blue-100"
          >
            <MapPin className="w-12 h-12 text-blue-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{userPlaces}</div>
            <div className="text-sm text-gray-600">Lugares</div>
          </motion.div>

          {/* Reviews Stat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="col-span-6 lg:col-span-2 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 rounded-3xl p-6 border border-amber-100"
          >
            <Star className="w-12 h-12 text-amber-600 mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">{userReviews}</div>
            <div className="text-sm text-gray-600">Reseñas</div>
          </motion.div>

          {/* Saved Count - Horizontal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-12 bg-gradient-to-r from-rose-50 to-pink-50 rounded-3xl p-6 border border-rose-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{savedPlaces.length}</div>
                  <div className="text-sm text-gray-600">Lugares guardados</div>
                </div>
              </div>
              <div className="text-4xl font-black text-rose-200">♥</div>
            </div>
          </motion.div>
        </div>

        {/* Places Section with Unique Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Colección</h2>
            <p className="text-gray-500 text-sm mt-1">Lugares que has guardado para explorar</p>
          </div>

          {savedPlacesList.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-16 text-center border border-gray-100">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <Heart className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tu colección está vacía
              </h3>
              <p className="text-gray-500 mb-6">Guarda lugares para comenzar tu colección personal</p>
              <Link
                to="/explore"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Explorar lugares
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {savedPlacesList.map((place, index) => {               
                 return (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="group relative"
                  >
                    <Link to={`/place/${place.id}`}>
                      <PlaceCard
                        place={place}
                        onClick={() => navigate(`/place/${place.id}`)}
                        className='w-80'
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de Preferencias */}

      <Preferences openPreferences={openPreferencesModal} setClosePreferences={setOpenPreferencesModal} />
    </div>
  );
};

export default Profile;