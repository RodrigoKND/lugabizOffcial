import { XCircle } from 'lucide-react';
import { EVENT_STATUS } from '@constants/steps';
import type { EventStatus } from '@domain/entities/EventDetailTypes';
import { CountdownTimer } from '@presentation/components/features/events/modal/CountdownTimer';

interface EventStatusBadgeProps {
  eventStatus: EventStatus;
  dateStart: Date;
  timeStart: string;
}

// Antes: cuenta regresiva. Durante: "En curso" en maíz. Después: "Finalizado" apagado. Sin animaciones que distraigan.
export function EventStatusBadge({ eventStatus, dateStart, timeStart }: EventStatusBadgeProps) {
  if (eventStatus === EVENT_STATUS.UPCOMING) {
    return <CountdownTimer endDate={dateStart} time={timeStart} />;
  }

  if (eventStatus === EVENT_STATUS.ONGOING) {
    return (
      <div className="mb-4 inline-flex h-9 items-center gap-2 rounded-full bg-lg-maiz px-3 text-xs font-black uppercase text-lg-ink">
        <span className="h-2 w-2 rounded-full bg-lg-ink" aria-hidden="true" /> En curso
      </div>
    );
  }

  if (eventStatus === EVENT_STATUS.FINISHED) {
    return (
      <div className="mb-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-lg-surface-2 px-3 text-xs font-black uppercase text-lg-dim">
        <XCircle className="h-4 w-4" /> Finalizado
      </div>
    );
  }

  return null;
}
