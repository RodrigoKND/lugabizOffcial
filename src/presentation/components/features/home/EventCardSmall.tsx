import { Calendar, MapPin, Bookmark } from 'lucide-react';
import { Event } from '@domain/entities';
import { getCategoryColor } from './categoryColors';
import { PlanButton } from '@presentation/components/features/social';
import { useAuth } from '@presentation/context';
import { useEventSaves } from '@presentation/hooks/useEventSaves';

interface EventCardSmallProps {
  event: Event;
  onClick: () => void;
  isViewed?: boolean;
}

const EventCardSmall: React.FC<EventCardSmallProps> = ({ event, onClick, isViewed }) => {
  const { user } = useAuth();
  const { saved, toggleSave } = useEventSaves(event.id, user?.id);
  const gradient = getCategoryColor(event.category?.name || '');

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
  };

  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      className={`shrink-0 w-52 snap-start group relative rounded-2xl overflow-hidden bg-stone-900 border shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97] cursor-pointer ${isViewed ? 'border-white/5 opacity-60 grayscale-[30%]' : 'border-white/10'}`}>
      <div className="aspect-4/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url(${event.image || ''})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white bg-linear-to-r ${gradient} shadow-xs z-10`}>
          {event.category?.name || 'Evento'}
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <PlanButton targetName={event.name} eventId={event.id} className="w-7 h-7" />
          <button onClick={handleSaveClick} aria-label={saved ? 'Quitar de guardados' : 'Guardar evento'}
            className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${saved ? 'bg-amber-500/90 hover:bg-amber-500' : 'bg-black/35 hover:bg-black/50'}`}>
            <Bookmark className={`w-3.5 h-3.5 transition-colors ${saved ? 'fill-white text-white' : 'text-white'}`} />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-1">
        <p className="text-primary-400 text-[11px] font-semibold flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(event.dateStart).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
        </p>
        <p className="text-white font-bold text-sm leading-tight line-clamp-2">{event.name}</p>
        <p className="text-white/40 text-[11px] flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {event.address}
        </p>
      </div>
    </div>
  );
};

export default EventCardSmall;
