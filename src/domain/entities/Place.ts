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
  savedCount: number;
}

export interface CreatePlaceData {
  name: string;
  description: string;
  address: string;
  categoryId: string;
  socialGroupIds: string[];
  image?: string;
  authorId: string;
}

export interface UpdatePlaceData {
  name?: string;
  description?: string;
  address?: string;
  categoryId?: string;
  socialGroupIds?: string[];
  image?: string;
  featured?: boolean;
}