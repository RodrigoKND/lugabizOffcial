import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import EventCard from '@presentation/components/features/events/EventCard';
import EventModal from '@presentation/components/features/events/modal/EventModal';
import { useSlide } from '@presentation/hooks';
import { mockEvents } from '@constants/mockEvents';

const EventsSection = ({
  selectedEventIndex,
  setSelectedEventIndex,
}: {
  selectedEventIndex: number | null;
  setSelectedEventIndex: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const [showAllEvents, setShowAllEvents] = useState(false);

  const {
    canSlideLeft,
    canSlideRight,
    slideLeft,
    slideRight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    visibleData
  } = useSlide({ data: mockEvents, visibleCount: 4 });

  const displayedEvents = showAllEvents ? mockEvents : visibleData;

  return (
    <>
      <motion.section
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-20"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <header>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">¿Sabes qué hacer hoy?</h2>
              </div>
              <p className="text-gray-600">Te aconsejamos estos eventos</p>
            </header>

            {mockEvents.length > 4 && !showAllEvents && (
              <div className="hidden lg:flex items-center gap-2">
                <button onClick={slideLeft} disabled={!canSlideLeft}
                  className={`p-2 rounded-full shadow-lg transition-all ${canSlideLeft ? 'hover:bg-gray-200 text-gray-900' : 'opacity-40 cursor-not-allowed text-gray-400'}`}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button onClick={slideRight} disabled={!canSlideRight}
                  className={`p-2 rounded-full shadow-lg transition-all ${canSlideRight ? 'hover:bg-gray-200 text-gray-900' : 'opacity-40 cursor-not-allowed text-gray-400'}`}>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => setShowAllEvents(true)}
                  className="p-2 rounded-full bg-linear-to-r from-primary-500 to-tomato text-white shadow-lg transition-all hover:scale-105">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
              className="grid grid-cols-4 gap-4">
              {displayedEvents.map((event, idx) => (
                <motion.div key={event.id}
                  transition={{ delay: 0.05 * idx }}>
                  <EventCard event={event} onClick={() => setSelectedEventIndex(mockEvents.findIndex(e => e.id === event.id))} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden md:block lg:hidden">
            <div className="grid grid-cols-3 gap-4">
              {displayedEvents.map((event, idx) => (
                <motion.div key={event.id}
                  transition={{ delay: 0.05 * idx }}>
                  <EventCard event={event} onClick={() => setSelectedEventIndex(mockEvents.findIndex(e => e.id === event.id))} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {mockEvents.map((event, idx) => (
                <motion.div key={event.id}
                  transition={{ delay: 0.05 * idx }} className="snap-start shrink-0 w-[70vw] max-w-70">
                  <EventCard event={event} onClick={() => setSelectedEventIndex(mockEvents.findIndex(e => e.id === event.id))} />
                </motion.div>
              ))}
            </div>
          </div>

          {showAllEvents && (
            <div className="hidden md:flex justify-center mt-8">
              <button onClick={() => setShowAllEvents(false)} className="text-gray-600 hover:text-gray-900 font-semibold">
                Ver menos
              </button>
            </div>
          )}
        </div>
      </motion.section>

      {selectedEventIndex !== null && (
        <EventModal
          event={mockEvents[selectedEventIndex]}
          onClose={() => setSelectedEventIndex(null)}
          onNext={() => setSelectedEventIndex((selectedEventIndex + 1) % mockEvents.length)}
          onPrev={() => setSelectedEventIndex((selectedEventIndex - 1 + mockEvents.length) % mockEvents.length)}
          hasNext={selectedEventIndex < mockEvents.length - 1}
          hasPrev={selectedEventIndex > 0}
        />
      )}
    </>
  );
};

export default EventsSection;