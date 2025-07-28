// Main exports
import { supabase } from './client';
import { authService } from './services/auth';
import { categoriesService } from './services/categories';
import { socialGroupsService } from './services/socialGroups';
import { placesService } from './services/places';
import { reviewsService } from './services/reviews';
import { savedPlacesService } from './services/savedPlaces';
import { storageService } from './services/storage';
import { realtimeService } from './services/realtime';

// Re-export everything
export { supabase };
export * from './types';
export {
  authService,
  categoriesService,
  socialGroupsService,
  placesService,
  reviewsService,
  savedPlacesService,
  storageService,
  realtimeService,
};

// Default export
export default {
  auth: authService,
  categories: categoriesService,
  socialGroups: socialGroupsService,
  places: placesService,
  reviews: reviewsService,
  savedPlaces: savedPlacesService,
  storage: storageService,
  realtime: realtimeService,
};