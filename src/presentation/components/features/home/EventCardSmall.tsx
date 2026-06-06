import { Calendar } from 'lucide-react';
import { Event } from '@domain/entities';
import { getCategoryColor } from './categoryColors';

interface EventCardSmallProps {
  event: Event;
  onClick: () => void;
  isViewed?: boolean;
}

const EventCardSmall: React.FC<EventCardSmallProps> = ({ event, onClick, isViewed }) => {
  const gradient = getCategoryColor(event.category?.name || '');
  return (
    <button onClick={onClick}
      className={`shrink-0 w-48 snap-start group relative rounded-xl overflow-hidden bg-white border shadow-xs hover:shadow-md transition-all active:scale-[0.97] ${isViewed ? 'border-stone-200/60 opacity-60 grayscale-[30%]' : 'border-primary-100/40'}`}>
      <div className="aspect-16/10 relative overflow-hidden">
        <div className={`absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300`}
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

export default EventCardSmall;
