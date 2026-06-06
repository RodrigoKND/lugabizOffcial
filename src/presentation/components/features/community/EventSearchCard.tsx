import { Calendar, MapPin, Users, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Event } from '@domain/entities';
import { getCategoryColor } from '@presentation/components/features/home/categoryColors';

interface EventSearchCardProps {
  event: Event;
}

const EventSearchCard: React.FC<EventSearchCardProps> = ({ event }) => {
  const navigate = useNavigate();
  const gradient = getCategoryColor(event.category?.name || '');
  const isPast = new Date(event.dateStart) < new Date();

  return (
    <button
      onClick={() => navigate(`/event/${event.id}`)}
      className="w-full text-left flex gap-4 p-4 bg-white rounded-2xl border border-primary-100/40 shadow-xs hover:shadow-md hover:border-primary-200 transition-all active:scale-[0.99] group"
    >
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden relative bg-primary-50">
        {event.image ? (
          <img src={event.image} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient}`} />
        )}
        {isPast && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">FINALIZADO</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-bold text-text-primary text-sm leading-tight line-clamp-2">{event.name}</p>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
            {event.category?.name || 'Evento'}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-[11px] text-text-secondary">
            <Calendar className="w-3 h-3 shrink-0" />
            {new Date(event.dateStart).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })}
            {event.timeStart && ` · ${event.timeStart}`}
          </span>

          <span className="flex items-center gap-1 text-[11px] text-text-secondary">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{event.address}</span>
          </span>
        </div>

        <div className="flex items-center gap-3 mt-2">
          {event.attendeesCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] text-text-secondary">
              <Users className="w-3 h-3" />
              {event.attendeesCount} asistentes
            </span>
          )}

          {event.isFree ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">Gratis</span>
          ) : event.price ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 font-semibold">
              ${event.price.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
};

export default EventSearchCard;
