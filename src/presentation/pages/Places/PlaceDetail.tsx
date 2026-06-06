import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { useSmartBack } from '@presentation/hooks';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, X, TrendingUp } from 'lucide-react';
import { usePlaces } from '@presentation/context';
import { latLngToCell, areCellsNearby } from '@infrastructure/utils/h3';
import { ReviewSection, ChatButton, ChatModal } from '@presentation/components/features';
import ConfirmDialog from '@presentation/components/ui/ConfirmDialog';
import { useSEO } from '@presentation/hooks/seo/useSEO';
import { usePlaceDetail } from '@presentation/hooks/places/usePlaceDetail';
import { usePlaceGallery } from '@presentation/hooks/places/usePlaceGallery';
import PlaceNotFound from '@presentation/components/features/places/detail/PlaceNotFound';
import PlaceImageSection from '@presentation/components/features/places/detail/PlaceImageSection';
import PlaceGallery from '@presentation/components/features/places/detail/PlaceGallery';
import PlaceInfoCard from '@presentation/components/features/places/detail/PlaceInfoCard';
import PlaceLocationCard from '@presentation/components/features/places/detail/PlaceLocationCard';
import PlaceSurveyModal from '@presentation/components/features/places/detail/PlaceSurveyModal';

const PlaceDetail: React.FC = () => {
  const goBack = useSmartBack('/');
  const routerLocation = useLocation();
  const isModal = !!routerLocation.state?.background;
  const { places } = usePlaces();
  const {
    place, user, isPlaceSaved, navigate, toggleSavedPlace,
    reviews, hasMoreReviews, loadMoreReviews,
    isChatOpen, setIsChatOpen,
    showDeleteConfirm, setShowDeleteConfirm, sharePlace, handleDelete,
  } = usePlaceDetail();
  const { galleryIdx, openGallery, closeGallery, prevImage, nextImage } = usePlaceGallery();
  const relatedPlaces = useMemo(() => {
    if (!place) return [];
    return places
      .filter(p => p.id !== place.id && p.category?.id === place.category?.id)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6);
  }, [place, places]);
  const [searchParams] = useSearchParams();
  const [showSurvey, setShowSurvey] = useState(!!searchParams.get('survey'));
  const surveyTriggeredRef = useRef(false);

  // Auto-abre el survey si el usuario ya está cerca del lugar
  useEffect(() => {
    if (surveyTriggeredRef.current || showSurvey) return;
    if (!place?.latitude || !place?.longitude) return;
    if (!navigator.geolocation) return;
    if (sessionStorage.getItem('_lugabiz_geo_started') !== 'true') return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (surveyTriggeredRef.current) return;
        const userCell = latLngToCell(pos.coords.latitude, pos.coords.longitude);
        const placeCell = latLngToCell(place.latitude!, place.longitude!);
        if (areCellsNearby(userCell, placeCell, 0.5)) {
          surveyTriggeredRef.current = true;
          setShowSurvey(true);
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    );
  }, [place?.latitude, place?.longitude, showSurvey]);

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

  if (!place) return <PlaceNotFound />;

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <ChatButton onClick={() => setIsChatOpen(true)} isVisible />
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div initial={{ y: -10 }} animate={{ y: 0 }} className="mb-6">
          {isModal ? (
            <button onClick={goBack}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-500">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={goBack} className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
          )}
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3 space-y-4">
            <PlaceImageSection
              place={place}
              user={user}
              onEdit={() => navigate(`/edit-place/${place.id}`)}
              onDeleteClick={() => setShowDeleteConfirm(true)}
            />
            <PlaceGallery
              place={place}
              galleryIdx={galleryIdx}
              onThumbnailClick={openGallery}
              onClose={closeGallery}
              onPrev={prevImage}
              onNext={nextImage}
            />

            {reviews.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {reviews.slice(0, 5).map((review) => (
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

            <ReviewSection placeId={place.id} reviews={reviews} hasMore={hasMoreReviews} onLoadMore={loadMoreReviews} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-4">
            <PlaceInfoCard
              place={place}
              isPlaceSaved={isPlaceSaved}
              user={user}
              onShare={sharePlace}
              onToggleSave={() => toggleSavedPlace(place.id)}
            />
            <PlaceLocationCard
              address={place.address}
              latitude={place.latitude}
              longitude={place.longitude}
            />
          </motion.div>
        </div>

        {relatedPlaces.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="mt-10 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <h3 className="font-bold text-sm uppercase tracking-wide text-text-primary">
                Más lugares de {place.category?.name}
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {relatedPlaces.map(p => (
                <Link
                  key={p.id}
                  to={`/place/${p.id}`}
                  state={{ background: isModal ? routerLocation.state.background : routerLocation }}
                  className="group rounded-xl overflow-hidden bg-white border border-primary-100/40 shadow-xs hover:shadow-md transition-all active:scale-[0.97]"
                >
                  <div className="aspect-square relative overflow-hidden bg-primary-50">
                    {p.image ? (
                      <img src={p.image} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-1.5 left-2 right-2">
                      <p className="text-white font-bold text-[11px] leading-tight truncate">{p.name}</p>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span className="text-white/80 text-[10px]">{p.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <PlaceSurveyModal
        open={showSurvey}
        onClose={() => setShowSurvey(false)}
        placeId={place.id}
        placeName={place.name}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar lugar"
        message={`¿Estás seguro de eliminar "${place.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  );
};

export default PlaceDetail;
