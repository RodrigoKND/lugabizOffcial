import { XCircle } from 'lucide-react';
import { EVENT_STATUS, type EventStatusType } from '@constants/steps';
import type { EventStatus } from '@domain/entities/EventDetailTypes';
import { CountdownTimer } from '@presentation/components/features/events/modal/CountdownTimer';

interface EventStatusBadgeProps {
  eventStatus: EventStatus;
  dateStart: Date;
  timeStart: string;
}

const STATUS_UI: Record<string, { className: string; label: string; dot?: boolean }> = {
  [EVENT_STATUS.FINISHED]: { className: 'bg-red-50 text-red-600 border-red-100', label: 'Evento Finalizado' },
  [EVENT_STATUS.ONGOING]: { className: 'bg-green-50 text-green-600 border-green-100', label: 'En Curso', dot: true },
};

export function EventStatusBadge({ eventStatus, dateStart, timeStart }: EventStatusBadgeProps) {
  if (eventStatus === EVENT_STATUS.UPCOMING) {
    return <CountdownTimer endDate={dateStart} time={timeStart} />;
  }

  const config = STATUS_UI[eventStatus];
  if (!config) return null;

  return (
    <div className={`mb-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.className}`}>
      {config.dot && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      {!config.dot && <XCircle className="w-3.5 h-3.5" />}
      {config.label}
    </div>
  );
}
