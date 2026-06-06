import { MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';
import type { Event } from './EventModal.types';

interface InfoProps {
  event: Event;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function EventModalInfo({ event, isExpanded, onToggleExpand, onClose }: InfoProps) {
  return (
    <div className="space-y-2.5">
      <CountdownTimer endDate={event.startDate} />

      <div>
        <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
        <div className="relative mt-1">
          <p className={`text-white/80 text-xs leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{event.description}</p>
          <div className="flex gap-2 mt-1">
            {!isExpanded && event.description.length > 100 && (
              <button onClick={onToggleExpand} className="text-amber-400 text-[10px] font-bold hover:underline">ver más</button>
            )}
            <Link to={`/event/${event.id}`} onClick={onClose} className="text-white/50 text-[10px] font-medium hover:text-white transition-colors">detalle</Link>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 space-y-1.5 border border-white/5">
        <div className="flex items-center gap-2 text-white/80">
          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] font-medium truncate">{event.location}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/80">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[11px]">{event.availableHours?.start} - {event.availableHours?.end}</span>
          </div>
          <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-white/50 uppercase tracking-wider">{event.category}</span>
        </div>
      </div>

      <Link to={`/event/${event.id}`} onClick={onClose}
        className="block w-full text-center bg-gradient-to-r from-amber-500 to-amber-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg active:scale-[0.97] transition-all">
        Asistiré
      </Link>
    </div>
  );
}
