import { supabase } from '../client';
import { RealtimeChannel } from '@supabase/supabase-js';

export const realtimeService = {
  // Subscribe to places changes
  subscribePlaces(callback: (payload: any) => void): RealtimeChannel {
    return supabase
      .channel('places')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'places' 
      }, callback)
      .subscribe();
  },

  // Subscribe to reviews changes for a specific place
  subscribeReviews(placeId: string, callback: (payload: any) => void): RealtimeChannel {
    return supabase
      .channel(`reviews:${placeId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reviews',
        filter: `place_id=eq.${placeId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to saved places changes for a user
  subscribeSavedPlaces(userId: string, callback: (payload: any) => void): RealtimeChannel {
    return supabase
      .channel(`saved_places:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'saved_places',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to user profile changes
  subscribeUserProfile(userId: string, callback: (payload: any) => void): RealtimeChannel {
    return supabase
      .channel(`user:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to new places in a category
  subscribeCategoryPlaces(categoryId: string, callback: (payload: any) => void): RealtimeChannel {
    return supabase
      .channel(`category_places:${categoryId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'places',
        filter: `category_id=eq.${categoryId}`
      }, callback)
      .subscribe();
  },

  // Unsubscribe from a channel
  unsubscribe(channel: RealtimeChannel) {
    return supabase.removeChannel(channel);
  },

  // Unsubscribe from all channels
  unsubscribeAll() {
    return supabase.removeAllChannels();
  },
};