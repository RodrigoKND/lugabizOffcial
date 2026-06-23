import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Zap } from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import {
  CompactCard,
  EventCardSmall, ScrollRow, TrendBanner, AuthModal,
  SurveyDeck,
} from '@presentation/components/features';
import { OnboardingAlert } from '@presentation/components/reusables';
import LoadingSkeleton from '@presentation/components/features/home/LoadingSkeleton';
import EmptyHomeState from '@presentation/components/features/home/EmptyHomeState';
import HomeWelcome from '@presentation/components/features/home/HomeWelcome';
import StoriesRow from '@presentation/components/features/home/StoriesRow';
import FeaturedHeroSection from '@presentation/components/features/home/FeaturedHeroSection';
import PersonalizedSections from '@presentation/components/features/home/PersonalizedSections';
import { useHomeEvents } from '@presentation/hooks/home/useHomeEvents';
import { useTrendingPlaces } from '@presentation/hooks/home/useTrendingPlaces';
import { useOnboardingAlerts } from '@presentation/hooks/onboarding/useOnboardingAlerts';
import { usePendingsurveys } from '@presentation/hooks/useSurveys';
import { usePersonalizedSections } from '@presentation/hooks/home/usePersonalizedSections';
import PostsFeed from '@presentation/components/features/posts/PostsFeed';

const Home: React.FC = () => {
  const { getRecentPlaces, isLoading, places, events } = usePlaces();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentStep, showAuthModal, setShowAuthModal, handleAction, handleDismiss } = useOnboardingAlerts();

  const {
    activeEvents, heroEvent, heroIndex,
    setHeroIndex, viewedEvents, markEventViewed,
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

  const handleEventClick = (eventId: string) => {
    markEventViewed(eventId);
    navigate(`/event/${eventId}`);
  };

  const handleHeroClick = (eventId: string) => {
    markEventViewed(eventId);
    navigate(`/event/${eventId}`);
  };

  return (
    <section className="relative min-h-screen pb-24 md:pb-0 bg-feed-bg">
      <OnboardingAlert type={currentStep || 'login'} isOpen={!!currentStep} onAction={handleAction} onDismiss={handleDismiss} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="register" />

      <div className="purple-blob w-80 h-80 bg-primary-200/25 -top-20 -left-20" />
      <div className="purple-blob w-96 h-96 bg-pink-200/15 top-1/3 -right-32" />
      <div className="purple-blob w-64 h-64 bg-primary-300/10 bottom-0 left-1/4" />

      {user && pendingSurveys.length > 0 && (
        <SurveyDeck surveys={pendingSurveys} onRefresh={refreshSurveys} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5">

        <HomeWelcome userName={user?.name} />

        {isLoading && trendingLoading && <LoadingSkeleton />}

        {!isLoading && !hasContent && (
          <EmptyHomeState onPublish={() => navigate('/add-place')} />
        )}

        {activeEvents.length > 0 && (
          <StoriesRow events={activeEvents} onEventClick={handleStoryClick} viewedEvents={viewedEvents} />
        )}

        {heroEvent && (
          <FeaturedHeroSection
            heroEvent={heroEvent}
            activeEvents={activeEvents}
            heroIndex={heroIndex}
            onSetHeroIndex={setHeroIndex}
            onEventClick={handleHeroClick}
          />
        )}

        {activeEvents.length > 0 && (
          <ScrollRow title="Próximos Eventos" subtitle={`${activeEvents.length} disponibles`}
            icon={<Calendar className="w-4 h-4 text-pink-500" />}>
            {activeEvents.map((event) => (
              <EventCardSmall
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event.id)}
                isViewed={viewedEvents.has(event.id)}
              />
            ))}
          </ScrollRow>
        )}

        {trendingPlaces.length > 0 && (
          <>
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <TrendingUp className="w-4 h-4 text-primary-400" />
              <h2 className="font-semibold text-[15px] text-white">En Tendencia</h2>
            </div>
            <TrendBanner places={trendingPlaces} />
            <ScrollRow title="" subtitle="Más lugares populares">
              {trendingPlaces.slice(1, 8).map((place: any) => (
                <CompactCard
                  key={place.id}
                  image={place.image}
                  name={place.name}
                  rating={place.rating}
                  category={place.category?.name}
                  to={`/place/${place.id}`}
                />
              ))}
            </ScrollRow>
          </>
        )}

        {recentPlaces.length > 1 && (
          <ScrollRow title="Recién Agregados" subtitle="Lo más nuevo"
            icon={<Zap className="w-4 h-4 text-amber-500" />}>
            {recentPlaces.map((place) => (
              <CompactCard
                key={place.id}
                image={place.image}
                name={place.name}
                rating={place.rating}
                category={place.category?.name}
                to={`/place/${place.id}`}
              />
            ))}
          </ScrollRow>
        )}

        <PersonalizedSections sections={personalizedSections} loading={sectionsLoading} />

        <PostsFeed compact />
      </motion.div>
    </section>
  );
};

export default Home;