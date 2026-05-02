import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlaces } from '@presentation/context';
import { Preferences, AllPlacesModal, EventsSection, PlacesCarousel, ChatButton, ChatModal } from '@presentation/components/features';
import { mockEvents } from '@constants/mockEvents';

const Home: React.FC = () => {
  const [showAllPlacesModal, setShowAllPlacesModal] = useState(false);
  const { getTopPlaces, getRecentPlaces, isLoading, places } = usePlaces();
  const navigate = useNavigate();
  
  const topPlaces = getTopPlaces().slice(0, 4);
  const recentPlaces = getRecentPlaces();
  const hasPlaces = !isLoading && places.length > 0;
  
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  
  return (
    <section className="relative min-h-screen overflow-hidden">

      <h4 className="text-gray-600 text-md bg-red-50 p-4 text-center">
        Esta página está en construcción - ¡Muy pronto!
      </h4>
      <div className="absolute top-60 left-20 w-50 h-50 bg-rose-300 opacity-30 rounded-full z-0 blur-3xl" />
      <div className="absolute top-20 right-10 w-62.5 h-62.5 bg-purple-300 opacity-30 rounded-full z-0 blur-3xl" />

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
          <div className="flex gap-4 overflow-x-auto justify-center"
          >
            {mockEvents.map((event, index) => (
              <button
                key={`story-${event.id}`}
                onClick={() => setSelectedEventIndex(index)}
                className="flex flex-col cursor-pointer items-center gap-4 shrink-0 group"
              >
                <div className={`p-0.75 rounded-md transition-transform group-active:scale-90 ${event.organizer.isNew
                  ? 'bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-500'
                  : 'bg-gray-300'
                  }`}>
                  <div className="p-0.5 bg-white rounded-md">
                    <img
                      src={event.organizer.avatar}
                      alt={event.organizer.name}
                      className="w-16 h-16 rounded-md object-cover border border-gray-100"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-gray-700 max-w-18.75 truncate text-center">
                  {event.organizer.name}
                </span>
              </button>
            ))}
          </div>
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
            </motion.section>
          )}
        </div>
      </div>
      <ChatButton onClick={() => setShowChatModal(true)} isVisible={hasPlaces} />
      <ChatModal isOpen={showChatModal} onClose={() => setShowChatModal(false)} />
    </section>
  );
};

export default Home;