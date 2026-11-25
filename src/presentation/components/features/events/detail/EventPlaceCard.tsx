import { MapPin, Clock, Info } from 'lucide-react';
import type { EventDetailSidebarProps } from '@domain/entities/props/EventSidebarProps';
import { LocationMapSection, InfoRow } from './sidebar';

type EventPlaceCardProps = Pick<EventDetailSidebarProps, 'event' | 'formattedDate' | 'hasCoords'>;

// Dónde y cuándo: mapa, "Cómo llegar", dirección, horario y capacidad.
export default function EventPlaceCard({ event, formattedDate, hasCoords }: EventPlaceCardProps) {
  const capacity = event.capacity ?? 0;

  return (
    <section aria-label="Dónde y cuándo" className="space-y-4 rounded-xl border-2 border-lg-surface-2 bg-lg-surface p-4">
      {hasCoords && <LocationMapSection coords={event.coords as [number, number]} />}
      <InfoRow icon={<MapPin />} label="Dónde" value={event.address} />
      <InfoRow icon={<Clock />} label="Cuándo"
        value={`${formattedDate} · ${event.timeStart}${event.timeEnd ? ` – ${event.timeEnd}` : ''}`} />
      {capacity > 0 && <InfoRow icon={<Info />} label="Capacidad" value={`${capacity} personas`} />}
    </section>
  );
}
