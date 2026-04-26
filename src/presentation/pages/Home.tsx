import React, { useState } from 'react';
import { motion } from 'framer-motion';
import AllPlacesModal from '@/presentation/components/features/AllPlacesModal';
import Preferences from '@/presentation/components/features/Preferences';
import CustomToast from '@/presentation/components/features/CustomToast';
import EventsSection, { mockEvents } from '@/presentation/components/features/EventSection';
import PlacesCarousel from '@/presentation/components/features/PlacesCarousel';
import { usePlaces } from '@/presentation/context/PlacesContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/presentation/hooks/useNotifications';

const Home: React.FC = () => {
  const [showAllPlacesModal, setShowAllPlacesModal] = useState(false);
  const { getTopPlaces, getRecentPlaces } = usePlaces();
  const navigate = useNavigate();
  const { resultNotification } = useNotifications();

  const topPlaces = getTopPlaces().slice(0, 4);
  const recentPlaces = getRecentPlaces();

  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);


  return (
    <section className="relative min-h-screen overflow-hidden">
      <h4 className="text-gray-600 text-md bg-red-50 p-4 text-center">
        Esta página está en construcción - ¡Muy pronto!
      </h4>
      <div className="absolute top-60 left-20 w-[200px] h-[200px] bg-rose-300 opacity-30 rounded-full z-0 blur-3xl" />
      <div className="absolute top-20 right-10 w-[250px] h-[250px] bg-purple-300 opacity-30 rounded-full z-0 blur-3xl" />

      <div className="relative z-10">
        {resultNotification && <CustomToast resultNotification={resultNotification} />}
        <Preferences />
        <AllPlacesModal isOpen={showAllPlacesModal} onClose={() => setShowAllPlacesModal(false)} />

        {/* Main Content - Sin hero tradicional */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2"
        >
          <div className="flex gap-4 overflow-x-auto justify-center"
          >
            {mockEvents.map((event, index) => (
              <button
                key={`story-${event.id}`}
                onClick={() => setSelectedEventIndex(index)}
                className="flex flex-col items-center gap-4 flex-shrink-0 group"
              >
                <div className={`p-[3px] rounded-md transition-transform group-active:scale-90 ${event.organizer.isNew
                  ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500'
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
                <span className="text-[11px] font-medium text-gray-700 max-w-[75px] truncate text-center">
                  {event.organizer.name}
                </span>
              </button>
            ))}
          </div>
          {/* Featured/Trending Places - Primera sección destacada */}
          {topPlaces.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-12"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Comienza aquí
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Busca y conoce lugares sobresalientes
                  </p>
                </div>
              </div>
              <PlacesCarousel
                places={topPlaces}
                setShowAllPlacesModal={setShowAllPlacesModal}
                onPlaceClick={(place) => navigate(`/place/${place.id}`)}
              />
            </motion.section>
          )}

          {/* Events Section */}
          <EventsSection
            selectedEventIndex={selectedEventIndex}
            setSelectedEventIndex={setSelectedEventIndex}
          />

          {/* Recent Places */}
          {recentPlaces.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="my-20"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    Recién agregados
                  </h2>
                  <p className="text-gray-600 text-sm sm:text-base">Lo más nuevo de tu zona</p>
                </div>
              </div>
              <PlacesCarousel
                setShowAllPlacesModal={setShowAllPlacesModal}
                places={recentPlaces}
                onPlaceClick={(place) => navigate(`/place/${place.id}`)}
              />
            </motion.section>
          )}
        </div>
      </div>
    </section>
  );
};

export default Home;