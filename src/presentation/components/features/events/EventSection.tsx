import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSlide } from '@presentation/hooks';
import { usePlaces } from '@presentation/context';
import { mapToMockEvent } from './EventSection.utils';
import { EventsSectionProps } from './EventSection.types';
import EventSectionHeader from './EventSectionHeader';
import EventSectionControls from './EventSectionControls';
import EventSectionGrid from './EventSectionGrid';
import EventSectionModal from './EventSectionModal';

const EventsSection = ({
  selectedEventIndex,
  setSelectedEventIndex,
  onEventView,
}: EventsSectionProps) => {
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
    visibleData,
  } = useSlide({ data: mappedEvents, visibleCount: 4 });

  const displayedEvents = showAllEvents ? mappedEvents : visibleData;

  const handleEventClick = (eventId: string) => {
    onEventView?.(eventId);
    setSelectedEventIndex(mappedEvents.findIndex((e) => e.id === eventId));
  };

  const selectedEvent =
    selectedEventIndex !== null ? mappedEvents[selectedEventIndex] ?? null : null;

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
            <EventSectionHeader />

            {mappedEvents.length > 4 && !showAllEvents && (
              <EventSectionControls
                canSlideLeft={canSlideLeft}
                canSlideRight={canSlideRight}
                onSlideLeft={slideLeft}
                onSlideRight={slideRight}
                onShowAll={() => setShowAllEvents(true)}
              />
            )}
          </div>

          <EventSectionGrid
            events={displayedEvents}
            onEventClick={handleEventClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {showAllEvents && (
            <div className="hidden md:flex justify-center mt-8">
              <button
                onClick={() => setShowAllEvents(false)}
                className="text-gray-600 hover:text-gray-900 font-semibold"
              >
                Ver menos
              </button>
            </div>
          )}
        </div>
      </motion.section>

      <EventSectionModal
        event={selectedEvent}
        onClose={() => setSelectedEventIndex(null)}
        onNext={() =>
          setSelectedEventIndex(
            (selectedEventIndex! + 1) % mappedEvents.length,
          )
        }
        onPrev={() =>
          setSelectedEventIndex(
            (selectedEventIndex! - 1 + mappedEvents.length) %
              mappedEvents.length,
          )
        }
        hasNext={selectedEventIndex! < mappedEvents.length - 1}
        hasPrev={selectedEventIndex! > 0}
      />
    </>
  );
};

export default EventsSection;
