import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import EventCard from '@presentation/components/features/events/EventCard';
import EventModal from '@presentation/components/features/events/modal/EventModal';
import { useSlide } from '@presentation/hooks';
import { usePlaces } from '@presentation/context';
import { Event } from '@domain/entities';

const mapToMockEvent = (event: Event) => ({
  id: event.id,
  title: event.name,
  description: event.description,
  location: event.address,
  imageUrl: event.image || '',
  startDate: event.dateStart,
  endDate: event.dateStart,
  availableDays: [],
  availableHours: { start: event.timeStart, end: event.timeEnd || '' },
  category: event.category?.name || 'General',
  organizer: {
    name: event.user?.name || 'Organizer',
    avatar: event.user?.avatar || '',
    isNew: false,
  },
  likes: event.attendeesCount || 0,
  comments: 0,
});

const EventsSection = ({
  selectedEventIndex,
  setSelectedEventIndex,
  onEventView,
}: {
  selectedEventIndex: number | null;
  setSelectedEventIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onEventView?: (eventId: string) => void;
}) => {
  const { events } = usePlaces();
  const [showAllEvents, setShowAllEvents] = useState(false);

  const mappedEvents = useMemo(() => events.map(mapToMockEvent), [events]);

  const {
    canSlideLeft,
    canSlideRight,
    slideLeft,
    slideRight,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    visibleData
  } = useSlide({ data: mappedEvents, visibleCount: 4 });

  const displayedEvents = showAllEvents ? mappedEvents : visibleData;

  const handleEventClick = (eventId: string) => {
    onEventView?.(eventId);
    setSelectedEventIndex(mappedEvents.findIndex(e => e.id === eventId));
  };

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

            {mappedEvents.length > 4 && !showAllEvents && (
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
                  <EventCard event={event} onClick={() => handleEventClick(event.id)} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="hidden md:block lg:hidden">
            <div className="grid grid-cols-3 gap-4">
              {displayedEvents.map((event, idx) => (
                <motion.div key={event.id}
                  transition={{ delay: 0.05 * idx }}>
                  <EventCard event={event} onClick={() => handleEventClick(event.id)} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="md:hidden">
            <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {displayedEvents.map((event, idx) => (
                <motion.div key={event.id}
                  transition={{ delay: 0.05 * idx }} className="snap-start shrink-0 w-[70vw] max-w-70">
                  <EventCard event={event} onClick={() => handleEventClick(event.id)} />
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

      {selectedEventIndex !== null && mappedEvents[selectedEventIndex] && (
        <EventModal
          event={mappedEvents[selectedEventIndex]}
          onClose={() => setSelectedEventIndex(null)}
          onNext={() => setSelectedEventIndex((selectedEventIndex + 1) % mappedEvents.length)}
          onPrev={() => setSelectedEventIndex((selectedEventIndex - 1 + mappedEvents.length) % mappedEvents.length)}
          hasNext={selectedEventIndex < mappedEvents.length - 1}
          hasPrev={selectedEventIndex > 0}
        />
      )}
    </>
  );
};

export default EventsSection;