import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Sparkles, Zap } from 'lucide-react';
import { Place } from '@domain/entities';
import { usePlaces, useAuth } from '@presentation/context';
import { eventViewsService } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';
import {
  Preferences, ChatModal, StoryCard, CompactCard,
  EventCardSmall, HeroBanner, ScrollRow, TrendBanner,
} from '@presentation/components/features';

const Home: React.FC = () => {
  const { getRecentPlaces, isLoading, places, events } = usePlaces();
  const { user, showPreferences, setShowPreferences } = useAuth();
  const navigate = useNavigate();

  const [showChatModal] = useState(false);
  const [viewedEvents, setViewedEvents] = useState<Set<string>>(new Set());
  const [trendingPlaces, setTrendingPlaces] = useState<Place[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const recentPlaces = useMemo(() => getRecentPlaces(10), [getRecentPlaces]);

  useEffect(() => {
    if (!user) return;
    eventViewsService.getViewedEventIds(user.id).then(ids => {
      setViewedEvents(new Set(ids));
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    edgeService.getTrendingPlaces()
      .then((data) => {
        if (data) setTrendingPlaces(data);
      })
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  const markEventViewed = useCallback((eventId: string) => {
    if (!user) return;
    if (viewedEvents.has(eventId)) return;
    eventViewsService.markAsViewed(eventId, user.id).catch(() => {});
    setViewedEvents(prev => new Set(prev).add(eventId));
  }, [user, viewedEvents]);

  const heroEvent = useMemo(() => events.length > 0 ? events[0] : null, [events]);
  const hasContent = places.length > 0 || events.length > 0 || trendingPlaces.length > 0;

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
            <button onClick={() => navigate('/add-place')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all shadow-xs">
              Publicar Algo
            </button>
          </div>
        )}

        {/* Stories Row */}
        {events.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
              {events.slice(0, 8).map((event) => (
                <StoryCard
                  key={event.id}
                  image={event.image}
                  name={event.name}
                  onClick={() => { markEventViewed(event.id); navigate(`/event/${event.id}`); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* If no events but we have places, show a "descubre" banner instead of hero */}
        {!heroEvent && places.length > 0 && (
          <div className="mb-8 rounded-2xl bg-linear-to-br from-primary-500/10 via-primary-400/5 to-pink-400/10 border border-primary-200/30 p-6 sm:p-8 text-center">
            <Sparkles className="w-8 h-8 text-primary-400 mx-auto mb-3" />
            <h2 className="text-lg sm:text-xl font-bold text-text-primary">Descubre Lugares Increíbles</h2>
            <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
              Explora nuestra comunidad y encuentra tu próximo lugar favorito
            </p>
          </div>
        )}

        {/* Featured Event Hero */}
        {heroEvent && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              <h2 className="font-bold text-sm uppercase tracking-wider text-text-primary">Destacado</h2>
            </div>
            <HeroBanner
              image={heroEvent.image}
              name={heroEvent.name}
              description={heroEvent.description}
              category={heroEvent.category?.name}
              date={new Date(heroEvent.dateStart).toLocaleDateString('es', { day: 'numeric', month: 'long' })}
              time={heroEvent.timeStart}
              address={heroEvent.address}
              onClick={() => navigate(`/event/${heroEvent.id}`)}
            />
          </div>
        )}

        {/* Events Priority Row */}
        {events.length > 0 && (
          <ScrollRow title="Próximos Eventos" subtitle={`${events.length} disponibles`}
            icon={<Calendar className="w-4 h-4 text-pink-500" />}>
            {events.map((event) => (
              <EventCardSmall
                key={event.id}
                event={event}
                onClick={() => { markEventViewed(event.id); navigate(`/event/${event.id}`); }}
                isViewed={viewedEvents.has(event.id)}
              />
            ))}
          </ScrollRow>
        )}

        {/* Trending Places - server-side calculated */}
        {trendingPlaces.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3 px-1">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <h2 className="font-bold text-sm uppercase tracking-wide text-text-primary">En Tendencia</h2>
            </div>
            <TrendBanner places={trendingPlaces} onClick={(id) => navigate(`/place/${id}`)} />
            <ScrollRow title="" subtitle="Más lugares populares">
              {trendingPlaces.slice(1, 8).map((place: any) => (
                <CompactCard
                  key={place.id}
                  image={place.image}
                  name={place.name}
                  rating={place.rating}
                  category={place.category?.name}
                  onClick={() => navigate(`/place/${place.id}`)}
                />
              ))}
            </ScrollRow>
          </>
        )}

        {/* Recent Places Row - horizontal scroll, not grid */}
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
                onClick={() => navigate(`/place/${place.id}`)}
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