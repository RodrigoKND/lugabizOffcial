import { Calendar, Clock, Users, Tag } from 'lucide-react';
import { Event } from '@domain/entities';

interface EventDetailInfoProps {
  event: Event;
  formattedDate: string;
}

export default function EventDetailInfo({ event, formattedDate }: EventDetailInfoProps) {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-stone-800 leading-tight">
        {event.name}
      </h1>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-stone-100 shadow-xs">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-stone-700">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-stone-100 shadow-xs">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-stone-700">{event.timeStart}</span>
        </div>
        {event.capacity && (
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 border border-stone-100 shadow-xs">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-stone-700">{event.capacity} cupos</span>
          </div>
        )}
      </div>

      <p className="text-stone-600 leading-relaxed">
        {event.description}
      </p>

      {event.tags && event.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {event.tags.map((tag, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
              <Tag className="w-3 h-3" /> #{tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
