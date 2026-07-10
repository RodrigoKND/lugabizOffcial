import type { Event } from '@domain/entities/Event';
import type { EventStatus } from '@domain/entities/EventDetailTypes';

export interface EventDetailSidebarProps {
  event: Event;
  eventStatus: EventStatus;
  isAttending: boolean;
  isFull: boolean;
  attendeeCount: number;
  formattedDate: string;
  hasCoords: boolean;
  onAttend: () => void;
}
