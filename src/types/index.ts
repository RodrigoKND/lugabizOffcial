export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  category: Category;
  socialGroups: SocialGroup[];
  image?: string;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  featured?: boolean;
  createdAt: Date;
  authorId: string;
  savedCount?: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface SocialGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface PlaceFormData {
  name: string;
  description: string;
  address: string;
  category: string;
  socialGroups: string[];
  image?: File;
}

export type ProvidersOauth = 'google' | 'facebook';