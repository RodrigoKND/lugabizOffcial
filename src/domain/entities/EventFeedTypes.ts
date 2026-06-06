import { Event } from './Event';

export interface FeedEventProps {
  event: Event;
  isActive: boolean;
  onPrev: () => void;
  onNext: () => void;
  onCommentOpen: (eventId: string) => void;
  userId?: string;
}
