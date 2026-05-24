import { supabase } from '@lib/supabase';

export const eventViewsService = {
  async markAsViewed(eventId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('event_views')
      .upsert(
        { event_id: eventId, user_id: userId, viewed_at: new Date().toISOString() },
        { onConflict: 'event_id,user_id' }
      );

    if (error) throw error;
  },

  async isViewed(eventId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('event_views')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    return !!data;
  },

  async getViewedEventIds(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('event_views')
      .select('event_id')
      .eq('user_id', userId);

    return (data || []).map(item => item.event_id);
  },
};
