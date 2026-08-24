import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import {
  CompactCard,
  ScrollRow, AuthModal,
  SurveyDeck,
} from '@presentation/components/features';
import { OnboardingAlert } from '@presentation/components/reusables';
import LoadingSkeleton from '@presentation/components/features/home/LoadingSkeleton';
import EmptyHomeState from '@presentation/components/features/home/EmptyHomeState';
import HomeHero from '@presentation/components/features/home/HomeHero';
import StoriesRow from '@presentation/components/features/home/StoriesRow';
import PersonalizedSections from '@presentation/components/features/home/PersonalizedSections';
import { useHomeEvents } from '@presentation/hooks/home/useHomeEvents';
import { useTrendingPlaces } from '@presentation/hooks/home/useTrendingPlaces';
import { useOnboardingAlerts } from '@presentation/hooks/onboarding/useOnboardingAlerts';
import { usePendingsurveys } from '@presentation/hooks/useSurveys';
import { usePersonalizedSections, type HomeSection } from '@presentation/hooks/home/usePersonalizedSections';
import PostsFeed from '@presentation/components/features/posts/PostsFeed';

const Home: React.FC = () => {
  const { getRecentPlaces, isLoading, places, events } = usePlaces();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentStep, showAuthModal, setShowAuthModal, handleAction, handleDismiss } = useOnboardingAlerts();

  const {
    sortedActiveEvents, viewedEvents, markEventViewed, likedEvents,
  } = useHomeEvents(events, user?.id);

  const { trendingPlaces, trendingLoading } = useTrendingPlaces();

  const recentPlaces = useMemo(() => getRecentPlaces(10), [getRecentPlaces]);
  const hasContent = places.length > 0 || events.length > 0 || trendingPlaces.length > 0;

  const { surveys: pendingSurveys, refresh: refreshSurveys } = usePendingsurveys();

  const storedCoords = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('_lugabiz_last_pos');
      if (!raw) return { lat: undefined, lng: undefined };
      const { lat, lng } = JSON.parse(raw);
      return { lat: lat as number | undefined, lng: lng as number | undefined };
    } catch { return { lat: undefined, lng: undefined }; }
  }, []);
  const { sections: personalizedSections, loading: sectionsLoading } = usePersonalizedSections(
    places, events, user?.id ?? null, undefined, storedCoords.lat, storedCoords.lng,
  );

  const handleStoryClick = (eventId: string) => {
    markEventViewed(eventId);
    navigate(`/events/feed?start=${eventId}`);
  };

  // El servidor de trending a veces devuelve muy pocos resultados (ej. 1 solo
  // lugar) y dejaba la fila viéndose vacía; se completa con recientes sin repetir.
  const recommendedPlaces = useMemo(() => {
    const seen = new Set(trendingPlaces.map(p => p.id));
    const filler = recentPlaces.filter(p => !seen.has(p.id));
    return [...trendingPlaces, ...(filler as unknown as Record<string, unknown>[])].slice(0, 10);
  }, [trendingPlaces, recentPlaces]);

  // Sin login no hay personalización, pero la home nunca queda vacía:
  // sección genérica con lugares del catálogo.
  const genericSections = useMemo<HomeSection[]>(() => {
    if (user || places.length < 4) return [];
    return [{
      id: 'descubre',
      title: 'Descubre Lugabiz',
      subtitle: 'Lugares que te pueden gustar',
      type: 'places',
      places: places.slice(0, 12),
      events: [],
    }];
  }, [user, places]);
  const homeSections = personalizedSections.length > 0 ? personalizedSections : genericSections;

  return (
    <section className="relative min-h-screen pb-24 md:pb-0 bg-[#f7f5fb]">
      <OnboardingAlert type={currentStep || 'login'} isOpen={!!currentStep} onAction={handleAction} onDismiss={handleDismiss} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="register" />

      {user && pendingSurveys.length > 0 && (
        <SurveyDeck surveys={pendingSurveys} onRefresh={refreshSurveys} />
      )}

      <HomeHero />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-2 pb-8">

        {isLoading && trendingLoading && <LoadingSkeleton />}

        {!isLoading && !hasContent && (
          <EmptyHomeState onPublish={() => navigate('/add-place')} />
        )}

        {recommendedPlaces.length > 0 && (
          <ScrollRow title="Recomendado para ti" icon={<Star className="w-5 h-5 fill-primary-500 text-primary-500" />}
            seeAllTo="/comunidad">
            {recommendedPlaces.slice(0, 10).map((place: Record<string, unknown>) => (
              <CompactCard
                key={place.id}
                image={place.image}
                name={place.name}
                rating={place.rating}
                category={place.category?.name}
                to={`/place/${place.id}`}
                tiktokUrl={place.socialLinks?.tiktok}
                placeId={String(place.id)}
                socialGroup={(place.socialGroups as { name: string; icon: string }[] | undefined)?.[0]}
              />
            ))}
          </ScrollRow>
        )}

        {sortedActiveEvents.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2.5">
                <Star className="w-5 h-5 fill-primary-500 text-primary-500" />
                <h2 className="font-bold text-xl sm:text-2xl text-[#241b3e] leading-none">Explora eventos</h2>
              </div>
              <button
                onClick={() => navigate('/events/feed')}
                className="flex items-center gap-0.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Ver todas
                <span aria-hidden="true">›</span>
              </button>
            </div>
            <StoriesRow events={sortedActiveEvents} onEventClick={handleStoryClick} viewedEvents={viewedEvents} likedEvents={likedEvents} />
          </>
        )}

        <PersonalizedSections sections={homeSections} loading={sectionsLoading} />

        <PostsFeed compact />
      </motion.div>
    </section>
  );
};

export default Home;
