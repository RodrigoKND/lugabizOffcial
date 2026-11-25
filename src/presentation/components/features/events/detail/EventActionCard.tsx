import { Users, XCircle, CheckCircle2 } from 'lucide-react';
import { EVENT_STATUS } from '@constants/steps';
import type { EventDetailSidebarProps } from '@domain/entities/props/EventSidebarProps';
import { PlanButton, PlansCountBadge } from '@presentation/components/features/social';
import GroupPickButton from '@presentation/components/features/social/pick/GroupPickButton';
import { EventStatusBadge } from './EventStatusBadge';
import { formatPrice, CouponsSection, StatusBlock } from './sidebar';
import { spotsLabel } from './sidebar/spots';

type EventActionCardProps = Pick<EventDetailSidebarProps, 'event' | 'eventStatus' | 'isAttending' | 'isFull' | 'attendeeCount' | 'onAttend'>;

// La decisión: precio, cuántos van y UN botón grande ("¡Voy!"). En celular va justo debajo de la portada.
export default function EventActionCard({ event, eventStatus, isAttending, isFull, attendeeCount, onAttend }: EventActionCardProps) {
  const spots = spotsLabel(event.capacity ?? 0, attendeeCount);
  const ongoing = eventStatus === EVENT_STATUS.ONGOING;

  return (
    <aside aria-label="Asistencia" className="rounded-xl border-2 border-lg-text bg-lg-surface p-4 poster-shadow">
      <EventStatusBadge eventStatus={eventStatus} dateStart={event.dateStart} timeStart={event.timeStart} />

      <div className="flex items-end justify-between gap-3">
        <p className="font-flyer text-4xl text-lg-text">{event.isFree ? 'Gratis' : formatPrice(event)}</p>
        <div className="text-right text-sm text-lg-dim">
          <p className="flex items-center justify-end gap-1.5">
            <Users className="h-4 w-4" />
            <span className="font-bold text-lg-text">{attendeeCount}</span> {attendeeCount === 1 ? 'va' : 'van'}
          </p>
          {spots && <p className="text-xs">{spots}</p>}
          <PlansCountBadge count={event.plansCount} className="mt-1" />
        </div>
      </div>

      {event.priceNote && <p className="mt-3 rounded-lg bg-lg-surface-2 p-3 text-sm text-lg-text">{event.priceNote}</p>}
      {ongoing && event.coupons && event.coupons.length > 0 && <CouponsSection coupons={event.coupons} />}

      <div className="mt-4 space-y-3">
        {eventStatus === EVENT_STATUS.FINISHED ? (
          <StatusBlock icon={<XCircle />} text="Evento finalizado" />
        ) : isFull && !isAttending ? (
          <StatusBlock icon={<XCircle />} text="Cupo lleno" className="bg-lg-coral/20 text-lg-coral" />
        ) : (
          <button type="button" onClick={onAttend} aria-pressed={isAttending}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-lg text-lg font-black transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lg-text ${isAttending ? 'bg-lg-maiz text-lg-ink' : 'bg-lg-accent text-lg-ink'}`}>
            {isAttending ? <><CheckCircle2 className="h-5 w-5" /> Ya vas</> : '¡Voy!'}
          </button>
        )}
        <PlanButton targetName={event.name} eventId={event.id} variant="detail" theme="light" className="w-full" />
        <GroupPickButton draft={{ key: `event:${event.id}`, eventId: event.id, name: event.name, image: event.image }} className="w-full" />
      </div>
    </aside>
  );
}
