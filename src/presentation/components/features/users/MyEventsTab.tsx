import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Users, MapPin, X } from 'lucide-react';
import { Event } from '@domain/entities';

interface MyEventsTabProps {
  events: Event[];
  onEventCreate: () => void;
  onDelete: (id: string) => void;
}

const MyEventsTab: React.FC<MyEventsTabProps> = ({ events, onEventCreate, onDelete }) => {
  if (events.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-lg-dim font-semibold uppercase tracking-wide">0 eventos</p>
          <button onClick={onEventCreate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-lg-accent text-lg-ink rounded-lg text-xs font-semibold hover:bg-lg-accent transition-all">
            <Plus className="w-3 h-3" /> Crear
          </button>
        </div>
        <div className="bg-lg-surface rounded-2xl p-12 text-center border border-lg-surface-2">
          <Calendar className="w-10 h-10 text-primary-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-lg-text mb-1">Sin eventos</h3>
          <p className="text-sm text-lg-dim mb-5">Crea tu primer evento</p>
          <button onClick={onEventCreate}
            className="inline-flex items-center gap-2 bg-lg-accent text-lg-ink px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-lg-accent transition-all">
            <Plus className="w-4 h-4" /> Crear Evento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-lg-dim font-semibold uppercase tracking-wide">{events.length} eventos</p>
        <button onClick={onEventCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-lg-accent text-lg-ink rounded-lg text-xs font-semibold hover:bg-lg-accent transition-all">
          <Plus className="w-3 h-3" /> Crear
        </button>
      </div>
      <div className="space-y-3">
        {events.slice(0, 20).map(event => (
          <div key={event.id}
            className="bg-lg-surface rounded-xl p-4 border border-lg-surface-2 hover:shadow-sm transition-all flex items-center gap-3">
            {event.image && (
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-lg-surface-2 shrink-0">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${event.image})` }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {event.category && <span className="px-1.5 py-0.5 bg-lg-surface-2 text-lg-accent rounded text-[10px] font-semibold">{event.category.name}</span>}
                <p className="text-xs text-lg-dim">{event.dateStart.toLocaleDateString()}</p>
              </div>
              <Link to={`/event/${event.id}`} className="font-semibold text-sm text-lg-text hover:text-lg-accent transition-colors truncate block">
                {event.name}
              </Link>
              <div className="flex items-center gap-3 text-[11px] text-lg-dim mt-0.5">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.attendeesCount}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.address}</span>
              </div>
            </div>
            <button onClick={() => onDelete(event.id)}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0">
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyEventsTab;
