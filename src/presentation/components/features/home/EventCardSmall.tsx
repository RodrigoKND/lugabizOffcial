import { Calendar, MapPin, Bookmark } from 'lucide-react';
import { Event } from '@domain/entities';
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

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
  };

  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter') onClick(); }}
      className={`shrink-0 w-48 snap-start group relative rounded-2xl bg-lg-surface p-2 hover:bg-lg-surface-2 hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.97] cursor-pointer ${isViewed ? 'opacity-60 grayscale-[30%]' : ''}`}>
      <div className="aspect-[4/3] relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url(${event.image || ''})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full sticker-tag text-[10px] text-lg-ink bg-lg-accent z-10`}>
          {event.category?.name || 'Evento'}
        </div>

        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <PlanButton targetName={event.name} eventId={event.id} className="w-7 h-7" />
          <button onClick={handleSaveClick} aria-label={saved ? 'Quitar de guardados' : 'Guardar evento'}
            className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${saved ? 'bg-lg-accent' : 'bg-lg-text/90 hover:bg-lg-text'}`}>
            <Bookmark className={`w-3.5 h-3.5 transition-colors ${saved ? 'fill-lg-ink text-lg-ink' : 'text-lg-ink'}`} />
          </button>
        </div>
      </div>

      <div className="pt-2 pb-1 px-1 space-y-0.5">
        <p className="text-lg-accent text-[11px] font-bold flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(event.dateStart).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
        </p>
        <p className="text-lg-text font-bold text-[14px] leading-tight line-clamp-2">{event.name}</p>
        <p className="text-lg-dim text-[11px] flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 shrink-0" />
          {event.address}
        </p>
      </div>
    </div>
  );
};

export default EventCardSmall;
