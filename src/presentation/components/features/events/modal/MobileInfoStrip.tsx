import { MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';
import type { Event } from './EventModal.types';

interface MobileInfoProps {
  event: Event;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function MobileInfoStrip({ event, isExpanded, onToggleExpand, onClose }: MobileInfoProps) {
  return (
    <div className="md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-10">
      <CountdownTimer endDate={event.startDate} />
      <h3 className="text-white font-bold text-base mt-1">{event.title}</h3>
      <p className={`text-white/70 text-xs mt-0.5 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{event.description}</p>
      {event.description.length > 100 && (
        <button onClick={onToggleExpand} className="text-amber-400 text-[10px] font-bold mt-0.5">
          {isExpanded ? 'ver menos' : 'ver más'}
        </button>
      )}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1 text-white/60">
          <MapPin className="w-3 h-3 text-amber-400" />
          <span className="text-[10px] truncate max-w-[140px]">{event.location}</span>
        </div>
        <div className="flex items-center gap-1 text-white/60">
          <Clock className="w-3 h-3 text-amber-400" />
          <span className="text-[10px]">{event.availableHours?.start}</span>
        </div>
      </div>
      <Link to={`/event/${event.id}`} onClick={onClose}
        className="mt-2 block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2 rounded-lg font-semibold text-xs">
        Asistiré
      </Link>
    </div>
  );
}
