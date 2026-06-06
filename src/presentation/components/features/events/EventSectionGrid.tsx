import React from 'react';
import { motion } from 'framer-motion';
import EventCard from './EventCard';
import { MappedEvent } from './EventSection.types';

interface EventSectionGridProps {
  events: MappedEvent[];
  onEventClick: (eventId: string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

const EventSectionGrid = ({
  events,
  onEventClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: EventSectionGridProps) => (
  <>
    <div className="hidden lg:block">
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="grid grid-cols-4 gap-4"
      >
        {events.map((event, idx) => (
          <motion.div key={event.id} transition={{ delay: 0.05 * idx }}>
            <EventCard event={event} onClick={() => onEventClick(event.id)} />
          </motion.div>
        ))}
      </div>
    </div>

    <div className="hidden md:block lg:hidden">
      <div className="grid grid-cols-3 gap-4">
        {events.map((event, idx) => (
          <motion.div key={event.id} transition={{ delay: 0.05 * idx }}>
            <EventCard event={event} onClick={() => onEventClick(event.id)} />
          </motion.div>
        ))}
      </div>
    </div>

    <div className="md:hidden">
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
        {events.map((event) => (
          <div key={event.id} className="snap-start shrink-0 w-[70vw] max-w-70">
            <EventCard event={event} onClick={() => onEventClick(event.id)} />
          </div>
        ))}
      </div>
    </div>
  </>
);

export default EventSectionGrid;
