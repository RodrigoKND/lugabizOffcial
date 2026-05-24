import { supabase } from '@lib/supabase';

export const eventSavesService = {
  async getSave(eventId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('event_saves')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .maybeSingle();

    return !!data;
  },

  async toggleSave(eventId: string, userId: string): Promise<boolean> {
    const existing = await this.getSave(eventId, userId);

    if (existing) {
      const { error } = await supabase
        .from('event_saves')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('event_saves')
        .insert({ event_id: eventId, user_id: userId });

      if (error) throw error;
      return true;
    }
  },
};
