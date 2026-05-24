import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Share2, Heart, HeartOff, Calendar, Eye, Pencil, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import { ReviewSection, ChatButton, ChatModal } from '@presentation/components/features';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { realtimeService } from '@lib/supabase/services/notifications/websocket';

const PlaceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlaceById } = usePlaces();
  const { user, isSaved, toggleSavedPlace } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const place = getPlaceById(id || '');

  useSEO({
    title: place?.name || 'Lugar',
    description: place?.description || 'Detalles del lugar',
    image: place?.image,
    url: window.location.href,
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

  useEffect(() => {
    if (!id) return;
    const unsubscribe = realtimeService.subscribeToReviews(() => {
      console.log('New review received');
    }, id);
    return unsubscribe;
  }, [id]);

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
      toast.success('Enlace copiado!');
    }
  };

  const isPlaceSaved = user && isSaved(place.id);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <ChatButton onClick={() => setIsChatOpen(true)} isVisible />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }} className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors font-medium">
            <ArrowLeft className="w-5 h-5" />
            Volver
          </Link>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-stone-100 aspect-4/3 lg:aspect-auto lg:h-125">
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
                {user?.id === place.authorId && (
                  <div className="flex gap-1.5 ml-auto">
                    <button onClick={() => navigate(`/edit-place/${place.id}`)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-md">
                      <Pencil className="w-4 h-4 text-stone-700" />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all shadow-md">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {place.gallery && place.gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                {place.gallery.map((url, i) => (
                  <button key={i} onClick={() => setGalleryIdx(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all hover:opacity-90 ${url === place.image ? 'border-amber-400' : 'border-transparent'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {galleryIdx !== null && place.gallery && (
              <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setGalleryIdx(null)}>
                <div className="relative max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => setGalleryIdx(null)}
                    className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  <img src={place.gallery[galleryIdx]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    {galleryIdx > 0 && (
                      <button onClick={() => setGalleryIdx(i => i - 1)}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all -ml-12">
                        <ChevronLeft className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    {galleryIdx < place.gallery.length - 1 && (
                      <button onClick={() => setGalleryIdx(i => i + 1)}
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all -mr-12">
                        <ChevronRight className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {place.gallery.map((_, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === galleryIdx ? 'bg-white w-4' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </div>
              </div>
            )}

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

              <div className="flex items-center gap-4 mb-5 flex-wrap">
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

              {place.socialGroups && place.socialGroups.length > 0 && (
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

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={sharePlace}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-100 font-medium transition-all text-sm flex-1">
                  <Share2 className="w-4 h-4" /> Compartir
                </button>
                <button onClick={() => {
                  if (!user) { toast.error('Inicia sesión para guardar'); return; }
                  toggleSavedPlace(place.id);
                }}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-medium transition-all text-sm flex-1 ${
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
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={async () => {
          try {
            const { placesService } = await import('@lib/supabase');
            await placesService.deletePlace(place.id);
            toast.success('Lugar eliminado');
            navigate('/');
          } catch { toast.error('Error al eliminar'); }
        }}
        title="Eliminar lugar"
        message={`¿Estás seguro de eliminar "${place.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};

export default PlaceDetail;
