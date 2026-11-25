import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useSmartBack } from '@presentation/hooks';
import { ArrowLeft, X, BarChart3, Loader2 } from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import { latLngToCell, areCellsNearby } from '@infrastructure/utils/h3';
import { ReviewSection } from '@presentation/components/features';
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
import PlaceSurveyStats from '@presentation/components/features/places/detail/PlaceSurveyStats';
import HiddenPlaceBanner from '@presentation/components/features/places/detail/HiddenPlaceBanner';
import PlaceReviewStrip from '@presentation/components/features/places/detail/PlaceReviewStrip';
import RelatedPlacesRow from '@presentation/components/features/places/detail/RelatedPlacesRow';
import PlaceLoginGate from '@presentation/components/features/places/detail/PlaceLoginGate';

const PlaceDetail: React.FC = () => {
  const goBack = useSmartBack('/');
  const routerLocation = useLocation();
  const isModal = !!routerLocation.state?.background;
  const { places } = usePlaces();
  const {
    place, isLoadingPlace, isAuthLoading, user, isPlaceSaved, navigate, toggleSavedPlace,
    reviews, hasMoreReviews, loadMoreReviews,
    showDeleteConfirm, setShowDeleteConfirm, sharePlace, handleDelete,
  } = usePlaceDetail();
  const { galleryIdx, openGallery, closeGallery, prevImage, nextImage } = usePlaceGallery();
  const { isAdmin } = useAuth();
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

  if (isLoadingPlace || isAuthLoading) return (
    <div role="status" aria-label="Cargando lugar" className="min-h-screen bg-lg-ground flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-lg-accent" />
    </div>
  );
  if (!place && !user) return <PlaceLoginGate onHome={() => navigate('/')} />;
  if (!place) return <PlaceNotFound />;

  return (
    <div className="min-h-screen bg-lg-ground text-lg-text">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="mb-4">
          {isModal ? (
            <button onClick={goBack} aria-label="Cerrar"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-lg-surface text-lg-dim transition-colors hover:bg-lg-surface-2 hover:text-lg-text focus-visible:outline-2 focus-visible:outline-lg-accent">
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button onClick={goBack}
              className="group flex h-11 items-center gap-2 rounded-lg pr-3 font-bold text-lg-dim transition-colors hover:text-lg-text focus-visible:outline-2 focus-visible:outline-lg-accent">
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" /> Volver
            </button>
          )}
        </nav>

        {place.hidden && (
          <div className="mb-6">
            <HiddenPlaceBanner placeId={place.id} isOwner={user?.id === place.authorId} />
          </div>
        )}

        {/* Celular: portada → acciones → ubicación → reseñas. Escritorio: portada y reseñas a la izquierda, acciones y ubicación a la derecha. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-5">
          <div className="order-1 lg:col-span-3 lg:col-start-1 lg:row-start-1">
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
          </div>

          <div className="order-2 space-y-4 lg:col-span-2 lg:col-start-4 lg:row-span-2 lg:row-start-1">
            <PlaceInfoCard
              place={place}
              isPlaceSaved={isPlaceSaved}
              user={user}
              onShare={sharePlace}
              onToggleSave={() => toggleSavedPlace(place.id)}
            />
            <PlaceLocationCard address={place.address} latitude={place.latitude} longitude={place.longitude} />

            {/* Stats de encuestas: visible solo para el dueño del lugar */}
            {user?.id === place.userId && (
              <section aria-label="Estadísticas de encuestas" className="rounded-xl border-2 border-lg-surface-2 bg-lg-surface p-4">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-lg-text">
                  <BarChart3 className="h-4 w-4 text-lg-accent" /> Estadísticas de encuestas
                </h2>
                <PlaceSurveyStats placeId={place.id} />
              </section>
            )}
          </div>

          <div className="order-3 space-y-4 lg:col-span-3 lg:col-start-1 lg:row-start-2">
            <PlaceReviewStrip reviews={reviews} />
            <ReviewSection placeId={place.id} reviews={reviews} hasMore={hasMoreReviews} onLoadMore={loadMoreReviews} />
          </div>
        </div>

        <RelatedPlacesRow
          places={relatedPlaces}
          categoryName={place.category?.name}
          backgroundLocation={isModal ? routerLocation.state.background : routerLocation}
        />
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
