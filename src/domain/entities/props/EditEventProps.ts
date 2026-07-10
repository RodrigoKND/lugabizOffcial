import type { SocialLinks } from '@domain/entities/SocialLinks';
import type { PriceOption, CouponEntry } from '@domain/entities/Event';

export interface EventFormFields {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  dateStart: string;
  dateEnd: string;
  timeStart: string;
  timeEnd: string;
  price: number;
  capacity: number;
  isFree: boolean;
  tags: string;
  priceOptions: PriceOption[];
  priceNote: string;
  coupons: CouponEntry[];
  socialLinks: SocialLinks;
}
