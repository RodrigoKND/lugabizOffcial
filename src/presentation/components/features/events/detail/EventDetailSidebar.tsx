import { MapPin, Clock, Users, Info, XCircle, CheckCircle2, Ticket } from 'lucide-react';
import { Event } from '@domain/entities';
import type { EventStatus } from '@domain/entities/EventDetailTypes';
import { Map, MapMarker, MarkerContent } from '@presentation/components/ui/map';
import { CountdownTimer } from '@presentation/components/features/events/modal/CountdownTimer';

interface EventDetailSidebarProps {
  event: Event;
  eventStatus: EventStatus;
  isAttending: boolean;
  isFull: boolean;
  attendeeCount: number;
  formattedDate: string;
  hasCoords: boolean;
  onAttend: () => void;
}

export default function EventDetailSidebar({
  event, eventStatus, isAttending, isFull, attendeeCount, formattedDate, hasCoords, onAttend,
}: EventDetailSidebarProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm sticky top-24">
      {eventStatus === 'finished' && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
          <XCircle className="w-3.5 h-3.5" /> Evento Finalizado
        </div>
      )}
      {eventStatus === 'ongoing' && (
        <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> En Curso
        </div>
      )}
      {eventStatus === 'upcoming' && (
        <div className="mb-4">
          <CountdownTimer endDate={event.dateStart} />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Precio</p>
          <p className="text-2xl font-bold text-stone-800">
            {event.isFree ? 'Gratis' : `Bs. ${event.price}`}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-sm text-stone-500">
            <Users className="w-4 h-4" />
            <span className="font-semibold">{attendeeCount}</span>
            <span>asistentes</span>
          </div>
          {event.capacity && (
            <p className="text-[10px] text-stone-400 mt-0.5">
              {event.capacity - attendeeCount} cupos disponibles
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {hasCoords && (
          <div className="rounded-2xl overflow-hidden border border-stone-100" style={{ height: '160px' }}>
            <Map center={[event.coords[1], event.coords[0]]} zoom={15} style={{ width: '100%', height: '100%' }}>
              <MapMarker longitude={event.coords[1]} latitude={event.coords[0]}>
                <MarkerContent>
                  <div style={{ width: 36, height: 36, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                    <svg viewBox="0 0 48 48" fill="none">
                      <path d="M24 2C15.164 2 8 9.164 8 18c0 12 16 28 16 28s16-16 16-28C40 9.164 32.836 2 24 2z" fill="#D4785C" />
                      <path d="M24 2c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8z" fill="white" />
                      <circle cx="24" cy="10" r="4" fill="#D4785C" />
                    </svg>
                  </div>
                </MarkerContent>
              </MapMarker>
            </Map>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="bg-amber-50 p-2.5 rounded-xl"><MapPin className="w-5 h-5 text-amber-500" /></div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase">Ubicación</p>
            <p className="text-sm font-medium text-stone-700">{event.address}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-amber-50 p-2.5 rounded-xl"><Clock className="w-5 h-5 text-amber-500" /></div>
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase">Fecha y Hora</p>
            <p className="text-sm font-medium text-stone-700">{formattedDate}</p>
            <p className="text-sm text-stone-500">{event.timeStart}{event.timeEnd ? ` - ${event.timeEnd}` : ''}</p>
          </div>
        </div>

        {event.capacity && (
          <div className="flex items-start gap-3">
            <div className="bg-amber-50 p-2.5 rounded-xl"><Info className="w-5 h-5 text-amber-500" /></div>
            <div>
              <p className="text-xs font-semibold text-stone-400 uppercase">Capacidad</p>
              <p className="text-sm font-medium text-stone-700">{event.capacity} personas</p>
            </div>
          </div>
        )}
      </div>

      {eventStatus === 'finished' ? (
        <div className="w-full py-4 rounded-2xl font-bold text-base bg-stone-100 text-stone-400 border border-stone-200 flex items-center justify-center gap-3 cursor-not-allowed">
          <XCircle className="w-5 h-5" /> Evento Finalizado
        </div>
      ) : isFull && !isAttending ? (
        <div className="w-full py-4 rounded-2xl font-bold text-base bg-red-50 text-red-400 border border-red-200 flex items-center justify-center gap-3 cursor-not-allowed">
          <XCircle className="w-5 h-5" /> Cupo Lleno
        </div>
      ) : (
        <button onClick={onAttend}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 ${isAttending
            ? 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
            : 'bg-amber-500 text-white hover:bg-amber-600 shadow-md active:scale-[0.98]'
            }`}>
          {isAttending ? <><CheckCircle2 className="w-5 h-5" /> Asistiré</> : <><Ticket className="w-5 h-5" /> Confirmar Asistencia</>}
        </button>
      )}
    </div>
  );
}
