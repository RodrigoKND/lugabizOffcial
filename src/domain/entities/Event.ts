import type { SocialLinks } from './SocialLinks';

export interface PriceOption {
  label: string;
  price: number;
  priceMax?: number;
}

export interface CouponEntry {
  code: string;
  description: string;
}

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
  gallery?: string[];
  dateStart: Date;
  dateEnd?: Date;
  timeStart: string;
  timeEnd?: string;
  price?: number;
  priceOptions?: PriceOption[];
  priceNote?: string;
  coupons?: CouponEntry[];
  capacity?: number;
  isFree: boolean;
  tags?: string[];
  socialLinks?: SocialLinks;
  coords: number[];
  userId: string;
  user?: {
    name: string;
    avatar?: string;
  };
  attendeesCount: number;
  attendeeAvatars?: string[];
  plansCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleEntry {
  date: string;
  timeStart: string;
  timeEnd: string;
}

export interface CreateEventData {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  image?: string;
  gallery?: string[];
  dateStart: string;
  dateEnd?: string;
  timeStart: string;
  timeEnd?: string;
  price?: number;
  priceOptions?: PriceOption[];
  priceNote?: string;
  coupons?: CouponEntry[];
  capacity?: number;
  isFree: boolean;
  tags?: string[];
  socialLinks?: SocialLinks;
  coords: number[];
  userId: string;
  schedules?: ScheduleEntry[] | null;
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
