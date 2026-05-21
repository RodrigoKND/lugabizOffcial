export interface Event {
  id: string;
  name: string;
  description: string;
  address: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    description: string;
  };
  image?: string;
  dateStart: Date;
  timeStart: string;
  timeEnd?: string;
  price?: number;
  capacity?: number;
  isFree: boolean;
  tags?: string[];
  coords: number[];
  userId: string;
  user?: {
    name: string;
    avatar?: string;
  };
  attendeesCount: number;
  attendeeAvatars?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEventData {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  image?: string;
  dateStart: string;
  timeStart: string;
  timeEnd?: string;
  price?: number;
  capacity?: number;
  isFree: boolean;
  tags?: string[];
  coords: number[];
  userId: string;
}

export interface EventAttendance {
  id: string;
  eventId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  sharedBy?: string;
  confirmed: boolean;
  createdAt: Date;
}

export interface EventShare {
  id: string;
  eventId: string;
  sharedBy: string;
  sharedUrl: string;
  createdAt: Date;
}
