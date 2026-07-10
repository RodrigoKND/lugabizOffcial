import { MapPin, Clock, Users, Info, XCircle, CheckCircle2, Ticket } from 'lucide-react';
import { Button } from '@presentation/components/ui/button';
import { Section } from '@presentation/components/ui/section';
import { EVENT_STATUS } from '@constants/steps';
import { EventStatusBadge } from './EventStatusBadge';
import type { EventDetailSidebarProps } from '@domain/entities/props/EventSidebarProps';
import { formatPrice, CouponsSection, LocationMapSection, InfoRow, StatusBlock } from './sidebar';

export default function EventDetailSidebar({
  event, eventStatus, isAttending, isFull, attendeeCount, formattedDate, hasCoords, onAttend,
}: EventDetailSidebarProps) {
  const capacity = event.capacity ?? 0;
  const availableSpots = capacity - attendeeCount;

  return (
    <Section level="card" className="sticky top-24" as="aside">
      <EventStatusBadge eventStatus={eventStatus} dateStart={event.dateStart} timeStart={event.timeStart} />

      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Precio</p>
          <p className="text-2xl font-bold text-stone-800">
            {event.isFree ? 'Gratis' : formatPrice(event)}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-stone-500">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{attendeeCount}</span>
            <span>asistentes</span>
          </div>
          {capacity > 0 && (
            <p className="text-[10px] text-stone-400 mt-0.5">{availableSpots} cupos disponibles</p>
          )}
        </div>
      </header>

      {event.priceNote && (
        <div className="mb-6 -mt-3 p-3 bg-amber-50/60 border border-amber-100 rounded-xl text-xs text-stone-600">
          {event.priceNote}
        </div>
      )}

      {eventStatus === EVENT_STATUS.ONGOING && event.coubons && event.coubons.length > 0 && (
        <CouponsSection coupons={event.coubons} />
      )}

      <nav className="space-y-4 mb-6">
        {hasCoords && (
          <LocationMapSection coords={event.coords} />
        )}
        <InfoRow icon={<MapPin />} label="Ubicación" value={event.address} />
        <InfoRow
          icon={<Clock />}
          label="Fecha y Hora"
          value={`${formattedDate} ${event.timeStart}${event.timeEnd ? ` - ${event.timeEnd}` : ''}`}
        />
        {capacity > 0 && (
          <InfoRow icon={<Info />} label="Capacidad" value={`${capacity} personas`} />
        )}
      </nav>

      <footer>
        {eventStatus === EVENT_STATUS.FINISHED ? (
          <StatusBlock icon={<XCircle />} text="Evento Finalizado" />
        ) : isFull && !isAttending ? (
          <StatusBlock icon={<XCircle />} text="Cupo Lleno" className="bg-red-50 text-red-400 border-red-200" />
        ) : (
          <Button
            onClick={onAttend}
            variant={isAttending ? 'secondary' : 'primary'}
            size="lg"
            fullWidth
            className={isAttending ? '!bg-stone-100 !text-stone-600 !border !border-stone-200 hover:!bg-stone-200' : ''}
          >
            {isAttending ? <><CheckCircle2 className="w-5 h-5" /> Asistiré</> : <><Ticket className="w-5 h-5" /> Confirmar Asistencia</>}
          </Button>
        )}
      </footer>
    </Section>
  );
}


