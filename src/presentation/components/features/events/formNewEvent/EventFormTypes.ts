import type { PriceOption, CouponEntry, SocialLinks } from '@domain/entities';

export interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ValidationErrors {
  name?: string;
  description?: string;
  categoryId?: string;
  address?: string;
  dateStart?: string;
  timeStart?: string;
  coords?: string;
  schedules?: string;
}

export interface ScheduleEntry {
  date: string;
  timeStart: string;
  timeEnd: string;
}

export type ScheduleMode = 'single' | 'range' | 'custom';

export interface FormData {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  dateStart: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
  capacity: number;
  price: number;
  priceOptions: PriceOption[];
  priceNote: string;
  coupons: CouponEntry[];
  isFree: boolean;
  tags: string;
  socialLinks: SocialLinks;
  coords: number[];
  scheduleMode: ScheduleMode;
  schedules: ScheduleEntry[];
}

export const TOTAL_STEPS = 3;
