import { Calendar, MapPin, Bookmark } from 'lucide-react';
import { Event } from '@domain/entities';
import { PlanButton } from '@presentation/components/features/social';
import { useAuth } from '@presentation/context';
import { useEventSaves } from '@presentation/hooks/useEventSaves';
import CartelFrame from '@presentation/components/features/cartel/CartelFrame';
import VerdictRow from '@presentation/components/features/cartel/VerdictRow';
import { useCardReaction } from '@presentation/hooks/verdicts/useCardReaction';
import GoingButton from './GoingButton';

interface EventCardSmallProps {
  event: Event;
  onClick: () => void;
  isViewed?: boolean;
}

export default function EventCardSmall({ event, onClick, isViewed }: EventCardSmallProps) {
  const { user } = useAuth();
  const { saved, toggleSave } = useEventSaves(event.id, user?.id);
  const reaction = useCardReaction('event', event.id);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
  };

  return (
    <CartelFrame name={event.name} to={`/event/${event.id}`} category={event.category?.name || 'Evento'}
      image={event.image} onClick={onClick} reaction={reaction}
      className={`w-48 ${isViewed ? 'opacity-60 grayscale-[30%]' : ''}`}
      topRight={
        <>
          <PlanButton targetName={event.name} eventId={event.id} className="w-7 h-7" />
          <button onClick={handleSaveClick} aria-label={saved ? 'Quitar de guardados' : 'Guardar evento'}
            className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${saved ? 'bg-lg-accent' : 'bg-lg-text/90 hover:bg-lg-text'}`}>
            <Bookmark className={`w-3.5 h-3.5 transition-colors ${saved ? 'fill-lg-ink text-lg-ink' : 'text-lg-ink'}`} />
          </button>
        </>
      }
      meta={
        <div className="space-y-0.5">
          <p className="text-lg-accent text-[11px] font-bold flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(event.dateStart).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-lg-dim text-[11px] flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {event.address}
          </p>
        </div>
      }
      footer={
        <>
          <GoingButton eventId={event.id} initialCount={event.attendeesCount ?? 0} />
          <VerdictRow reaction={reaction} />
        </>
      }
    />
  );
}
