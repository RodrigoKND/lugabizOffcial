import { Tag } from 'lucide-react';
import { Event } from '@domain/entities';
import { SocialLinksRow } from '@presentation/components/reusables';

interface EventDetailInfoProps {
  event: Event;
}

// Lo que el evento cuenta: descripción, etiquetas y redes. Fecha, hora y lugar viven en la portada y en la tarjeta del lugar.
export default function EventDetailInfo({ event }: EventDetailInfoProps) {
  return (
    <div className="space-y-4">
      <p className="max-w-prose whitespace-pre-line text-base leading-relaxed text-lg-text">{event.description}</p>

      {event.tags && event.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {event.tags.map(tag => (
            <li key={tag} className="inline-flex h-9 items-center gap-1 rounded-full bg-lg-surface-2 px-3 text-xs font-bold text-lg-accent">
              <Tag className="h-3 w-3" /> #{tag}
            </li>
          ))}
        </ul>
      )}

      <SocialLinksRow links={event.socialLinks} />
    </div>
  );
}
