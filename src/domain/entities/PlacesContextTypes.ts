import { ReactNode } from 'react';
import { Place, PlaceFormData, Category, SocialGroup, Event } from '@domain/entities';

export interface PlacesContextType {
  places: Place[];
  events: Event[];
  categories: Category[];
  socialGroups: SocialGroup[];
  isLoading: boolean;
  addPlace: (placeData: PlaceFormData) => Promise<boolean>;
  addReview: (placeId: string, rating: number | null, comment: string, parentId?: string) => Promise<boolean>;
  updateReview: (reviewId: string, rating: number, comment: string) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  addEvent: (eventData: any) => Promise<Event | null>;
  getPlaceById: (id: string) => Place | undefined;
  getPlacesByCategory: (categoryId: string) => Place[];
  getTopPlaces: () => Place[];
  getRecentPlaces: (limit?: number) => Place[];
  searchPlaces: (query: string) => Place[];
  refreshPlaces: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  getLengthPlacesByUserId: (userId: string) => Place[];
  getLengthReviewsByUserId: (userId: string) => number;
  getSavedPlacesByUserId: (userId: string) => Promise<Place[] | []>;
  getUserEvents: (userId: string) => Event[];
  getEventsAttending: (userId: string) => Promise<Event[]>;
}

export interface PlacesProviderProps {
  children: ReactNode;
}
