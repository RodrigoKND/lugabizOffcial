export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  imageUrl: string;
  startDate: Date;
  endDate?: Date;
  availableDays?: string[];
  availableHours?: { start: string; end: string };
  category: string;
  organizer: {
    name: string;
    avatar: string;
    isNew: boolean;
  };
  price?: string;
  capacity?: string;
  tags?: string[];
  locationCoords?: {
    latitude: number;
    longitude: number;
  };
  coverImage?: string | null;
  likes: number;
  comments: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  price?: string;
  capacity?: string;
  coverImage?: string | null;
  tags: string[];
  location: {
    latitude: number;
    longitude: number;
  } | null;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  createdAt: Date;
}