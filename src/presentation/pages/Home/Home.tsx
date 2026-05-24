<<<<<<< HEAD
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, Clock, ChevronRight, TrendingUp, Zap, Sparkles } from 'lucide-react';
import { usePlaces, useAuth } from '@presentation/context';
import { eventViewsService } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';
import { Preferences, ChatModal } from '@presentation/components/features';
import { Event, Place } from '@domain/entities';

function getCategoryColor(name: string) {
  const colors: Record<string, string> = {
    default: 'from-primary-400 to-pink-400',
    Comida: 'from-orange-400 to-red-400',
    Bebidas: 'from-amber-400 to-yellow-400',
    Naturaleza: 'from-green-400 to-emerald-400',
    Arte: 'from-purple-400 to-pink-400',
    Música: 'from-violet-400 to-purple-400',
    Deportes: 'from-blue-400 to-cyan-400',
  };
  return colors[name] || colors.default;
}
=======
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
    <section className="relative min-h-screen overflow-hidden">
>>>>>>> main

interface StoryCardProps {
  image?: string;
  name: string;
  onClick: () => void;
}

<<<<<<< HEAD
const StoryCard: React.FC<StoryCardProps> = ({ image, name, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5 shrink-0 group">
    <div className="p-[2px] rounded-full bg-gradient-to-br from-primary-400 via-pink-400 to-orange-400 group-active:scale-90 transition-transform">
      <div className="p-[2px] bg-white rounded-full">
        {image ? (
          <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-500">
            {name.charAt(0)}
          </div>
        )}
      </div>
    </div>
    <span className="text-[11px] font-medium text-text-secondary max-w-16 truncate text-center leading-tight">
      {name}
    </span>
  </button>
);

interface CompactCardProps {
  image?: string;
  name: string;
  rating: number;
  category: string;
  onClick: () => void;
}
=======
      <div className="relative z-10">
        <Preferences />
        <AllPlacesModal isOpen={showAllPlacesModal} onClose={() => setShowAllPlacesModal(false)} />

        {/* Main Content - Sin hero tradicional */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2">
          {isLoading && (
            <div className="py-8 text-center text-gray-500">Cargando contenido...</div>
          )}
          {!hasPlaces && (
            <p className="py-8 text-center text-gray-500">
              Aún no hay lugares disponibles. Si no ves contenido, revisa la conexión con la base de datos o agrega nuevos lugares desde la sección Publicar.
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
>>>>>>> main

const CompactCard: React.FC<CompactCardProps> = ({ image, name, rating, category, onClick }) => (
  <button onClick={onClick}
    className="shrink-0 w-40 snap-start group relative rounded-xl overflow-hidden bg-white border border-primary-100/40 shadow-xs hover:shadow-md transition-all active:scale-[0.97]">
    <div className="aspect-[3/4] relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
        style={{ backgroundImage: `url(${image || ''})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-semibold text-primary-600 shadow-xs z-10">
        {category}
      </span>
      <span className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-semibold text-white z-10">
        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
        {rating}
      </span>
      <div className="absolute bottom-2 left-2 right-2 z-10">
        <p className="text-white font-bold text-xs leading-tight truncate">{name}</p>
      </div>
    </div>
  </button>
);

interface EventCardSmallProps {
  event: Event;
  onClick: () => void;
  isViewed?: boolean;
}

const EventCardSmall: React.FC<EventCardSmallProps> = ({ event, onClick, isViewed }) => {
  const gradient = getCategoryColor(event.category?.name || '');
  return (
    <button onClick={onClick}
      className="shrink-0 w-48 snap-start group relative rounded-xl overflow-hidden bg-white border border-primary-100/40 shadow-xs hover:shadow-md transition-all active:scale-[0.97]">
      <div className="aspect-16/10 relative overflow-hidden">
        <div className={`absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300 ${isViewed ? 'opacity-70' : ''}`}
          style={{ backgroundImage: `url(${event.image || ''})` }} />
        <div className="absolute inset-0 bg-lienar-to-t from-black/70 via-black/10 to-transparent" />
        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-linear-to-r ${gradient} shadow-xs z-10`}>
          {event.category?.name || 'Evento'}
        </div>
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-white font-bold text-xs leading-tight truncate">{event.name}</p>
          <p className="text-white/70 text-[10px] mt-0.5 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {new Date(event.dateStart).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>
    </button>
  );
};

interface HeroBannerProps {
  image?: string;
  name: string;
  description: string;
  category?: string;
  date: string;
  time: string;
  address: string;
  onClick: () => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ image, name, description, category, date, time, address, onClick }) => {
  const gradient = getCategoryColor(category || '');
  return (
    <div onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group aspect-[2/1] sm:aspect-[3/1]">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
        style={{ backgroundImage: `url(${image || ''})` }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end sm:justify-center">
        <span className={`inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r ${gradient} mb-2 w-fit shadow-xs`}>
          {category || 'Destacado'}
        </span>
        <h2 className="text-white font-bold text-lg sm:text-2xl lg:text-3xl leading-tight max-w-lg">
          {name}
        </h2>
        <p className="text-white/70 text-xs sm:text-sm mt-1 max-w-md line-clamp-2">
          {description}
        </p>
        <div className="flex items-center gap-3 mt-2 sm:mt-3 text-[11px] text-white/60">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {date}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {address}</span>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="px-4 py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold hover:bg-primary-600 transition-colors">
            Asistiré
          </span>
        </div>
      </div>
    </div>
  );
};

interface ScrollRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const ScrollRow: React.FC<ScrollRowProps> = ({ title, subtitle, icon, children }) => (
  <section className="mb-7">
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2">
        {icon || <div className="w-1 h-4 rounded-full bg-primary-400" />}
        <div>
          <h2 className="font-bold text-sm sm:text-base text-text-primary uppercase tracking-wide">{title}</h2>
          {subtitle && <p className="text-[11px] text-text-secondary -mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-text-secondary" />
    </div>
    <div className="flex gap-3 overflow-x-auto scrollbar-hide md:-mx-4 mx-1  px-4 pb-1 snap-x snap-mandatory">
      {children}
    </div>
  </section>
);

interface TrendBannerProps {
  places: Place[];
  onClick: (id: string) => void;
}

const TrendBanner: React.FC<TrendBannerProps> = ({ places, onClick }) => {
  if (places.length === 0) return null;
  const top = places[0];
  return (
    <div onClick={() => onClick(top.id)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group mb-7 aspect-2/1 sm:aspect-4/1">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-500"
        style={{ backgroundImage: `url(${top.image || ''})` }} />
      <div className="absolute inset-0 bg-linear-to-r from-primary-900/80 via-primary-800/40 to-transparent" />
      <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-center">
        <span className="flex items-center gap-1.5 text-primary-200 text-xs font-semibold mb-2">
          <Zap className="w-3.5 h-3.5 fill-primary-300 text-primary-300" />
          #1 EN TENDENCIA
        </span>
        <h2 className="text-white font-bold text-xl sm:text-3xl leading-tight max-w-lg">
          {top.name}
        </h2>
        <p className="text-white/60 text-xs sm:text-sm mt-1 max-w-md line-clamp-1">
          {top.description}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-white text-xs font-semibold">{top.rating}</span>
          <span className="text-white/40 text-[10px]">· {top.category?.name}</span>
        </div>
      </div>
    </div>
  );
};

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