import { Category } from './Category';
import { SocialGroup } from './SocialGroup';
import { Review } from './Review';

export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  category: Category;
  socialGroups: SocialGroup[];
  image?: string;
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  featured: boolean;
  createdAt: Date;
  authorId: string;
  authorName?: string;
  authorAvatar?: string;
  savedCount: number;
  latitude?: number;
  longitude?: number;
  coords?: number[];
  amenities?: string[];
  gallery?: string[];
  viewsCount?: number;
}

export interface CreatePlaceData {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  socialGroupIds: string[];
  image?: string;
  gallery?: string[];
  authorId: string;
  latitude?: number;
  longitude?: number;
  coords?: number[];
  amenities?: string[];
}

export interface UpdatePlaceData {
  name?: string;
  description?: string;
  address?: string;
  categoryId?: string;
  socialGroupIds?: string[];
  image?: string;
  featured?: boolean;
  latitude?: number;
  longitude?: number;
}
