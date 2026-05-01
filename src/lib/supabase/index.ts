// Main exports
import { supabase } from '@lib/supabase/client';
import { authService } from '@lib/supabase//services/auth';
import { categoriesService } from '@lib/supabase//services/categories';
import { socialGroupsService } from '@lib/supabase//services/socialGroups';
import { placesService } from '@lib/supabase//services/places';
import { reviewsService } from '@lib/supabase//services/reviews';
import { savedPlacesService } from '@lib/supabase//services/savedPlaces';
import { storageService } from '@lib/supabase//services/storage';
import { realtimeService } from '@lib/supabase//services/realtime';

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