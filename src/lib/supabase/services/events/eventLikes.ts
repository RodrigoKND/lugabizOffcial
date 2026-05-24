import { supabase } from '@lib/supabase';

export const eventLikesService = {
  async getLike(eventId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    return !!data;
  },

  async getLikesCount(eventId: string): Promise<number> {
    const { count } = await supabase
      .from('event_likes')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', eventId);

    return count || 0;
  },

  async toggleLike(eventId: string, userId: string): Promise<{ liked: boolean; count: number }> {
    const existing = await this.getLike(eventId, userId);

    if (existing) {
      const { error } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('event_likes')
        .insert({ event_id: eventId, user_id: userId });

      if (error) throw error;
    }

    const count = await this.getLikesCount(eventId);
    return { liked: !existing, count };
  },
};
