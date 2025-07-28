import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Calendar, Share2, Heart, HeartOff } from 'lucide-react';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';
import ReviewSection from '../components/ReviewSection';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlaceById } = usePlaces();
  const { user, isSaved, toggleSavedPlace } = useAuth();

  const place = getPlaceById(id || '');

  if (!place) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lugar no encontrado</h2>
          <Link
            to={'/'}
            className="bg-primary-500 text-white px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      toast.error('No se pudo copiar el enlace');
    }
  };

  const shareWithWebAPI = async (place: { name: string; description: string }) => {
    try {
      await navigator.share({
        title: place.name,
        text: place.description,
        url: window.location.href,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error al compartir:', error.name);
      } else {
        console.error('Error desconocido al compartir:', error);
      }
      await copyToClipboard(window.location.href); // Fallback
    }
  };

  const handleShare = async () => {
    if (navigator.canShare({
      title: place.name,
      text: place.description
    })) {
      await shareWithWebAPI(place);
    } else {
      await copyToClipboard(window.location.href);
    }
  };


  const handleToggleSaved = () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar lugares');
      return;
    }
    toggleSavedPlace(place.id);
  };

  const isPlaceSaved = user && isSaved(place.id);
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link
            to={'/'}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="relative">
            <img
              src={place.image}
              alt={place.name}
              className="w-full h-64 md:h-96 object-cover"
            />
            <div className="absolute top-6 right-6 flex flex-col space-y-3">
              {place.featured && (
                <div className="bg-tomato text-white px-4 py-2 rounded-full text-sm font-medium">
                  Destacado
                </div>
              )}
              <div className={`px-4 py-2 rounded-full text-sm font-medium text-white`}
                style={{ backgroundColor: place.category.color }}>
                {place.category.name}
              </div>
              {place.socialGroups.map((group) => {
                const SocialGroupIcon = Icons[group.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                return (
                  <div key={group.id} className={`px-4 py-2 rounded-full text-sm font-medium text-white flex items-center space-x-2`} style={{
                    backgroundColor: group.color
                  }}>
                    <SocialGroupIcon className="w-4 h-4" />
                    <span>{group.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {place.name}
                </h1>

                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-medium">{place.rating}</span>
                    <span className="text-gray-500">({place.reviewCount} reseñas)</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-500">
                    <Calendar className="w-5 h-5" />
                    <span>{place.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                  <span>Compartir</span>
                </button>
                <button
                  onClick={handleToggleSaved}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-xl transition-colors ${isPlaceSaved
                    ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {isPlaceSaved ? <HeartOff className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                  <span>{isPlaceSaved ? 'Quitar' : 'Guardar'}</span>
                </button>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {place.description}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ubicación</h3>
              <div className="flex items-center space-x-3 text-gray-700">
                <MapPin className="w-5 h-5 text-primary-500" />
                <span className="text-lg">{place.address}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <ReviewSection placeId={place.id} reviews={place.reviews || []} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Información adicional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-primary-500" />
              <span className="text-gray-700">Publicado el {place.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceDetail;