import { Calendar, Clock, Users, Tag } from 'lucide-react';
import { Event } from '@domain/entities';
import { SocialLinksRow } from '@presentation/components/reusables';

interface EventDetailInfoProps {
  event: Event;
  formattedDate: string;
}

export default function EventDetailInfo({ event, formattedDate }: EventDetailInfoProps) {
  return (
    <>
      <h1 className="text-3xl md:text-4xl font-bold text-lg-text leading-tight">
        {event.name}
      </h1>

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 bg-lg-surface rounded-2xl px-4 py-2.5 border border-lg-surface-2 shadow-xs">
          <Calendar className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-lg-text">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 bg-lg-surface rounded-2xl px-4 py-2.5 border border-lg-surface-2 shadow-xs">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-lg-text">{event.timeStart}</span>
        </div>
        {(event.capacity ?? 0) > 0 && (
          <div className="flex items-center gap-2 bg-lg-surface rounded-2xl px-4 py-2.5 border border-lg-surface-2 shadow-xs">
            <Users className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-lg-text">{event.capacity} cupos</span>
          </div>
        )}
      </div>

      <p className="text-lg-dim leading-relaxed">
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

      <SocialLinksRow links={event.socialLinks} />
    </>
  );
}
