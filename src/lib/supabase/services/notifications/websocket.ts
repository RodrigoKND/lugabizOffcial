import { supabase } from '@lib/supabase';

type RealtimeCallback = (payload: any) => void;

export const realtimeService = {
  subscribeToTable(table: string, callback: RealtimeCallback, filter?: string) {
    const channel = supabase
      .channel(`table-changes-${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table,
        filter,
      }, (payload) => {
        callback(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToInserts(table: string, callback: RealtimeCallback, filter?: string) {
    const channel = supabase
      .channel(`inserts-${table}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table,
        filter,
      }, (payload) => {
        callback(payload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToUserNotifications(userId: string, callback: RealtimeCallback) {
    return this.subscribeToInserts('notifications', callback, `user_id=eq.${userId}`);
  },

  subscribeToNewPlaces(callback: RealtimeCallback) {
    return this.subscribeToInserts('places', callback);
  },

  subscribeToNewEvents(callback: RealtimeCallback) {
    return this.subscribeToInserts('events', callback);
  },

  subscribeToReviews(callback: RealtimeCallback, placeId?: string) {
    const filter = placeId ? `place_id=eq.${placeId}` : undefined;
    return this.subscribeToInserts('reviews', callback, filter);
  },

  async checkNearbyPlaces(latitude: number, longitude: number, radiusKm: number = 1): Promise<any[]> {
    const { data, error } = await supabase.rpc('find_nearby_places', {
      lat: latitude,
      lon: longitude,
      radius_km: radiusKm,
    });

    if (error) {
      console.error('Error finding nearby places:', error);
      return [];
    }
    return data || [];
  },
};

export default realtimeService;
