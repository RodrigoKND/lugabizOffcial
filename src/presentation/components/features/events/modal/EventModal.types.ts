export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  images?: string[];
  startDate: Date;
  endDate?: Date;
  availableDays?: string[];
  availableHours?: { start: string; end: string };
  category: string;
  organizer: { name: string; avatar: string; isNew: boolean };
  likes: number;
  comments: number;
}

export interface EventModalProps {
  event: Event;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}
