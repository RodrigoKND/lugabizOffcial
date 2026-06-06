export interface MappedEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  images?: string[];
  startDate: Date;
  endDate: Date;
  availableDays: never[];
  availableHours: { start: string; end: string };
  category: string;
  organizer: { name: string; avatar: string; isNew: boolean };
  likes: number;
  comments: number;
}

export interface EventsSectionProps {
  selectedEventIndex: number | null;
  setSelectedEventIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onEventView?: (eventId: string) => void;
}
