export type EventStatus = 'upcoming' | 'ongoing' | 'finished';

export interface EventAttendee {
  id: string;
  userName?: string;
  userAvatar?: string;
}
