import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import * as Icons from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, savedPlaces } = useAuth();
  const { places, getLengthPlacesByUserId, getLengthReviewsByUserId } = usePlaces();

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const savedPlacesList = places.filter(place => savedPlaces.includes(place.id));
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-primary-500 to-tomato p-8">
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar || '/assets/images/avatar.png'}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
              />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-white/90">{user.email}</p>
                <p className="text-white/80 text-sm">Miembro desde {user.createdAt.toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Heart className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{savedPlaces.length}</div>
                <div className="text-gray-600">Lugares guardados</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <MapPin className="w-8 h-8 text-tomato mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{getLengthPlacesByUserId(user.id).length}</div>
                <div className="text-gray-600">Lugares publicados</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{getLengthReviewsByUserId(user.id)}</div>
                <div className="text-gray-600">Reseñas escritas</div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <Heart className="w-6 h-6 text-primary-500" />
              <span>Lugares guardados</span>
            </h2>

            {savedPlacesList.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-500 mb-2">No tienes lugares guardados</h3>
                <p className="text-gray-400 mb-6">Explora y guarda tus lugares favoritos para verlos aquí</p>
                <button
                  onClick={() => navigate('/')}
                  className="bg-gradient-to-r from-primary-500 to-tomato text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Explorar lugares
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedPlacesList.map((place, index) => {
                  const primarySocialGroup = place.socialGroups[0];
                  const SocialGroupIcon = Icons[primarySocialGroup.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

                  return (
                    <motion.div
                      key={place.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex space-x-4">
                        <img
                          loading="lazy"
                          src={place.image}
                          alt={place.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1 truncate">{place.name}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{place.description}</p>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`px-2 py-1 rounded-full text-xs ${place.category.color} text-white`}>
                              {place.category.name}
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs ${primarySocialGroup.color} text-white flex items-center space-x-1`}>
                              <SocialGroupIcon className="w-3 h-3" />
                              <span>{primarySocialGroup.name}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{place.rating}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Link
                                to={`/place/${place.id}`}
                                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                              >
                                Ver detalle
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;