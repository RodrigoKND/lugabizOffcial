import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlaces } from '@presentation/context';
import { Preferences, AllPlacesModal, EventsSection, PlacesCarousel, ChatButton, ChatModal } from '@presentation/components/features';


const Home: React.FC = () => {
  const [showAllPlacesModal, setShowAllPlacesModal] = useState(false);
  const { getTopPlaces, getRecentPlaces, isLoading, places, events } = usePlaces();
  const navigate = useNavigate();
  
  const topPlaces = getTopPlaces().slice(0, 4);
  const recentPlaces = getRecentPlaces();
  const hasPlaces = !isLoading && places.length > 0;
  
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  const [viewedEvents, setViewedEvents] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('viewed_events');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const markEventViewed = useCallback((eventId: string) => {
    setViewedEvents(prev => {
      if (prev.has(eventId)) return prev;
      const next = new Set(prev);
      next.add(eventId);
      try { localStorage.setItem('viewed_events', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);
  
  return (
    <section className="relative min-h-screen pb-24 md:pb-0 bg-feed-bg">
      <Preferences openPreferences={showPreferences} setClosePreferences={setShowPreferences} />

      <div className="purple-blob w-80 h-80 bg-primary-200/25 -top-20 -left-20" />
      <div className="purple-blob w-96 h-96 bg-pink-200/15 top-1/3 -right-32" />
      <div className="purple-blob w-64 h-64 bg-primary-300/10 bottom-0 left-1/4" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-5">
        {/* Loading State */}
        {isLoading && trendingLoading && (
          <div className="space-y-4 mt-4">
            <div className="h-48 bg-primary-100/50 rounded-2xl animate-pulse" />
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-40 aspect-3/4 bg-primary-100/50 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasContent && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Aún no hay contenido</h3>
            <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">
              No hay lugares ni eventos disponibles. ¡Sé el primero en compartir!
            </p>
          )}
          {events.length > 0 && (
            <div className="flex gap-3 overflow-x-auto justify-center pb-2">
              {events.slice(0, 6).map((event, index) => {
                const isViewed = viewedEvents.has(event.id);
                return (
                <button
                  key={`story-${event.id}`}
                  onClick={() => { markEventViewed(event.id); setSelectedEventIndex(index); }}
                  className="flex flex-col cursor-pointer items-center gap-2 shrink-0 group"
                >
                  <div className={`p-0.75 rounded-full transition-all duration-300 group-active:scale-90 ${isViewed ? 'bg-stone-300' : 'bg-linear-to-br from-amber-400 to-orange-500'}`}>
                    <div className="p-0.5 bg-white rounded-full">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.name}
                          className={`w-14 h-14 rounded-full object-cover transition-all duration-300 ${isViewed ? 'opacity-60' : ''}`}
                        />
                      ) : (
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${isViewed ? 'bg-stone-200 text-stone-400' : 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700'}`}>
                          {event.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium max-w-16 truncate text-center transition-all duration-300 ${isViewed ? 'text-stone-400' : 'text-gray-700'}`}>
                    {event.name}
                  </span>
                </button>
                );
              })}
            </div>
          )}
          {/* Featured/Trending Places - Primera sección destacada */}
          {topPlaces.length > 0 && (
              <section className="mt-16">
              <header className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Comienza aquí
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Busca y conoce lugares sobresalientes
                </p>
              </header>
              <PlacesCarousel
                places={topPlaces}
                setShowAllPlacesModal={setShowAllPlacesModal}
                onPlaceClick={(place) => navigate(`/place/${place.id}`)}
              />
              </section>
          )}

          {/* Events Section */}
          <EventsSection
            selectedEventIndex={selectedEventIndex}
            setSelectedEventIndex={setSelectedEventIndex}
            onEventView={markEventViewed}
          />

          {/* Recent Places */}
          {recentPlaces.length > 0 && (
            <motion.section
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5 }}
              className="my-20"
            >
              <header className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Recién agregados
                </h2>
                <p className="text-gray-600 text-sm sm:text-base">
                  Lo más nuevo de tu zona
                </p>
              </header>

              <PlacesCarousel
                setShowAllPlacesModal={setShowAllPlacesModal}
                places={recentPlaces}
                onPlaceClick={(place) => navigate(`/place/${place.id}`)}
              />
            ))}
          </ScrollRow>
        )}
      </div>

      <ChatModal isOpen={showChatModal} onClose={() => {}} />
    </section>
  );
};

export default Home;