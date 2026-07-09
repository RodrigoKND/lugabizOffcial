import { Event } from './Event';

export interface StoriesRowProps {
  events: Event[];
  onEventClick: (eventId: string) => void;
  viewedEvents?: Set<string>;
  likedEvents?: Set<string>;
}

export interface FeaturedHeroSectionProps {
  heroEvent: Event;
  activeEvents: Event[];
  heroIndex: number;
  onSetHeroIndex: (index: number) => void;
  onEventClick: (eventId: string) => void;
}

export interface EmptyHomeStateProps {
  onPublish: () => void;
}

export interface UseHomeEventsReturn {
  activeEvents: Event[];
  sortedActiveEvents: Event[];
  heroEvent: Event | null;
  heroIndex: number;
  setHeroIndex: (index: number) => void;
  viewedEvents: Set<string>;
  markEventViewed: (eventId: string) => void;
  likedEvents: Set<string>;
}

export interface UseTrendingPlacesReturn {
  trendingPlaces: any[];
  trendingLoading: boolean;
}
