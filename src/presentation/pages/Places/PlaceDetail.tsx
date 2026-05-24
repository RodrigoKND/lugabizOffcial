<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Share2, Heart, HeartOff, Clock, Calendar, Eye } from 'lucide-react';
=======
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Share2, Heart, HeartOff, Clock, Calendar, Eye, Navigation } from 'lucide-react';
>>>>>>> main
import * as Icons from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import { ReviewSection } from '@presentation/components/features';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { useSEO } from '@presentation/hooks/seo/useSEO';
<<<<<<< HEAD
import { realtimeService } from '@lib/supabase/services/notifications/websocket';
=======
import { surveysService } from '@lib/supabase';
>>>>>>> main

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getPlaceById } = usePlaces();
  const { user, isSaved, toggleSavedPlace } = useAuth();
  const [showSurvey, setShowSurvey] = useState(false);
  const [survey, setSurvey] = useState({ isNearby: false, rating: 0, wouldRecommend: false, comment: '' });

  const place = getPlaceById(id || '');

  useSEO({
    title: place?.name || 'Lugar',
    description: place?.description || 'Detalles del lugar',
    image: place?.image,
    type: 'article',
    schema: place ? {
      '@type': 'LocalBusiness',
      name: place.name,
      description: place.description,
      address: { '@type': 'PostalAddress', streetAddress: place.address },
      image: place.image,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: place.rating,
        reviewCount: place.reviewCount,
      },
    } : undefined,
  });

<<<<<<< HEAD
  useEffect(() => {
    if (!place?.latitude || !place?.longitude) return;
    if (!('geolocation' in navigator)) return;

    const checkProximity = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      const R = 6371;
      const dLat = ((place.latitude! - latitude) * Math.PI) / 180;
      const dLon = ((place.longitude! - longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((latitude * Math.PI) / 180) *
          Math.cos((place.latitude! * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      if (distance < 1) {
        localStorage.setItem(`nearby_${place.id}`, 'true');
        toast.success(`Estás cerca de ${place.name}!`);
      }
    };

    const watchId = navigator.geolocation.watchPosition(checkProximity, () => {}, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 10000,
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [place?.id, place?.latitude, place?.longitude, place?.name]);
=======
  const handleSurvey = async () => {
    if (!user || !place) return;
    try {
      await surveysService.submitSurvey({
        userId: user.id,
        placeId: place.id,
        ...survey,
      });
      toast.success('Gracias por tu opinión!');
      setShowSurvey(false);
    } catch {
      toast.error('Error al enviar encuesta');
    }
  };
>>>>>>> main

  if (!place) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🦕</div>
          <h2 className="text-xl font-bold text-stone-800 mb-4">Lugar no encontrado</h2>
          <Link to="/" className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-amber-600 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const hasCoords = place.latitude && place.longitude;

  const sharePlace = async () => {
    const url = window.location.href;
<<<<<<< HEAD
    const shareData: ShareData = {
      title: `${place.name} | Lugabiz`,
      text: `${place.description}\n\n📍 ${place.address}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${url}`);
        toast.success('Enlace copiado!');
      }
    } catch {
      await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${url}`);
=======
    try {
      if (navigator.share) {
        await navigator.share({ title: place.name, text: place.description, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Enlace copiado!');
      }
    } catch {
      await navigator.clipboard.writeText(url);
>>>>>>> main
      toast.success('Enlace copiado!');
    }
  };

  const isPlaceSaved = user && isSaved(place.id);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }} className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-stone-100 aspect-[4/3] lg:aspect-auto lg:h-[500px]">
              <img src={place.image} alt={place.name}
                className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {place.featured && (
                  <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                    Destacado
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
                  style={{ backgroundColor: place.category.color }}>
                  {place.category.name}
                </span>
              </div>
            </div>

            {place.reviews && place.reviews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {place.reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2 border border-stone-100 shrink-0">
                    <img src={review.userAvatar || '/avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-semibold text-stone-700">{review.userName}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs text-stone-500">{review.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <ReviewSection placeId={place.id} reviews={place.reviews || []} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl lg:text-3xl font-bold text-stone-800 leading-tight">
                  {place.name}
                </h1>
              </div>

              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-stone-700">{place.rating}</span>
                  <span className="text-stone-400 text-sm">({place.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{place.createdAt.toLocaleDateString()}</span>
                </div>
                {place.viewsCount !== undefined && (
                  <div className="flex items-center gap-1.5 text-stone-400 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>{place.viewsCount}</span>
                  </div>
                )}
              </div>

              <p className="text-stone-600 leading-relaxed mb-6">
                {place.description}
              </p>

              {place.socialGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {place.socialGroups.map((group) => {
                    const Icon = Icons[group.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
                    return (
                      <span key={group.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: group.color }}>
                        {Icon && <Icon className="w-3 h-3" />}
                        {group.name}
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={sharePlace}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-100 font-medium transition-all text-sm">
                  <Share2 className="w-4 h-4" /> Compartir
                </button>
                <button onClick={() => {
                  if (!user) { toast.error('Inicia sesión para guardar'); return; }
                  toggleSavedPlace(place.id);
                }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-medium transition-all text-sm ${
                    isPlaceSaved
                      ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}>
                  {isPlaceSaved ? <HeartOff className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                  {isPlaceSaved ? 'Guardado' : 'Guardar'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
              <h3 className="font-semibold text-stone-800 mb-3">Ubicación</h3>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-stone-600">{place.address}</span>
              </div>

              {hasCoords && (
                <div className="rounded-2xl overflow-hidden border border-stone-100" style={{ height: '200px' }}>
                  <Map
                    center={[place.longitude!, place.latitude!]}
                    zoom={15}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <MapMarker longitude={place.longitude!} latitude={place.latitude!}>
                      <MarkerContent>
                        <div style={{
                          width: 40, height: 40,
                          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                        }}>
                          <svg viewBox="0 0 48 48" fill="none">
                            <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C"/>
                            <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white"/>
                            <circle cx="24" cy="10" r="4" fill="#D4785C"/>
                          </svg>
                        </div>
                      </MarkerContent>
                    </MapMarker>
                  </Map>
                </div>
              )}
            </div>

<<<<<<< HEAD
            {place.latitude && place.longitude && 'geolocation' in navigator && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-4 border border-purple-100">
                <p className="text-xs text-purple-600 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  La geolocalización detectará cuando estés cerca
                </p>
              </div>
=======
            {user && !showSurvey && (
              <button onClick={() => setShowSurvey(true)}
                className="w-full py-4 bg-stone-50 border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-100 font-medium transition-all text-sm flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" /> ¿Estuviste aquí? Deja tu opinión
              </button>
            )}

            {showSurvey && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
                <h3 className="font-semibold text-stone-800">¿Estuviste cerca de este lugar?</h3>
                <div className="flex gap-3">
                  <button onClick={() => setSurvey(s => ({ ...s, isNearby: true }))}
                    className={`flex-1 py-3 rounded-2xl font-medium transition-all text-sm ${survey.isNearby ? 'bg-green-500 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}>
                    Sí, estuve cerca
                  </button>
                  <button onClick={() => setSurvey(s => ({ ...s, isNearby: false }))}
                    className={`flex-1 py-3 rounded-2xl font-medium transition-all text-sm ${!survey.isNearby && survey.isNearby !== undefined ? 'bg-red-500 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}>
                    No
                  </button>
                </div>
                <div>
                  <p className="text-xs font-semibold text-stone-500 mb-2">Calificación</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setSurvey(s => ({ ...s, rating: n }))}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${survey.rating >= n ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}>
                        <Star className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={survey.wouldRecommend}
                    onChange={e => setSurvey(s => ({ ...s, wouldRecommend: e.target.checked }))}
                    className="w-5 h-5 rounded border-stone-300 text-amber-500 focus:ring-amber-400" />
                  <span className="text-sm text-stone-600">Lo recomendaría</span>
                </label>
                <textarea value={survey.comment} onChange={e => setSurvey(s => ({ ...s, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:border-amber-400 focus:bg-white focus:ring-0 transition-all text-stone-800 placeholder:text-stone-400 text-sm resize-none"
                  placeholder="Comentario adicional..." rows={3} />
                <div className="flex gap-3">
                  <button onClick={() => setShowSurvey(false)}
                    className="flex-1 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-600 font-medium text-sm hover:bg-stone-100">
                    Cancelar
                  </button>
                  <button onClick={handleSurvey}
                    className="flex-1 py-3 bg-amber-500 text-white rounded-2xl font-medium text-sm hover:bg-amber-600">
                    Enviar
                  </button>
                </div>
              </motion.div>
>>>>>>> main
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PlaceDetail;
