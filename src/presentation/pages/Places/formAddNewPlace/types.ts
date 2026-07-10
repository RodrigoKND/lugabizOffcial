import type { SocialLinks } from '@domain/entities';

interface DiscountInfo {
  hasDiscount: boolean;
  description?: string;
  code?: string;
  percentage?: number;
}

export interface PlaceFormData {
  name: string;
  description: string;
  address: string;
  category: string;
  socialGroups: string[];
  amenities: string[];
  discountInfo: DiscountInfo | undefined;
  socialLinks: SocialLinks;
  latitude: number | undefined;
  longitude: number | undefined;
}

export interface ValidationErrors {
  name?: string;
  description?: string;
  category?: string;
  socialGroups?: string;
  address?: string;
  images?: string;
}
