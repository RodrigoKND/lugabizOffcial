import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Calendar } from 'lucide-react';
import { Event } from '@domain/entities';

interface AttendingEventsTabProps {
  events: Event[];
}

const AttendingEventsTab: React.FC<AttendingEventsTabProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">0 eventos</p>
        <div className="bg-white rounded-2xl p-12 text-center border border-primary-100/40">
          <CheckCircle2 className="w-10 h-10 text-primary-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-text-primary mb-1">No asistes a eventos</h3>
          <Link to="/" className="inline-flex items-center gap-2 bg-primary-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-600 transition-all mt-5">
            Ver eventos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-text-secondary font-semibold uppercase tracking-wide px-1">{events.length} eventos</p>
      <div className="space-y-2">
        {events.slice(0, 30).map(event => (
          <Link key={event.id} to={`/event/${event.id}`}
            className="block bg-white rounded-xl p-4 border border-primary-100/40 hover:shadow-sm transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-50 shrink-0">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${event.image || ''})` }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-text-primary truncate">{event.name}</h4>
                <p className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                  <Calendar className="w-3 h-3" /> {event.dateStart.toLocaleDateString()} | {event.timeStart}
                </p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AttendingEventsTab;
