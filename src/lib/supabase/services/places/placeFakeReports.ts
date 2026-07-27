import { supabase } from '@lib/supabase/client';

export const placeFakeReportsService = {
  async reportFake(placeId: string, reporterId: string): Promise<void> {
    const { error } = await supabase
      .from('place_fake_reports')
      .insert({ place_id: placeId, reporter_id: reporterId });
    if (error) throw error;
  },

  async hasReported(placeId: string, reporterId: string): Promise<boolean> {
    const { data } = await supabase
      .from('place_fake_reports')
      .select('id')
      .eq('place_id', placeId)
      .eq('reporter_id', reporterId)
      .maybeSingle();
    return !!data;
  },

  async appeal(placeId: string, message: string): Promise<void> {
    const { error } = await supabase.rpc('appeal_hidden_place', { p_place_id: placeId, p_message: message });
    if (error) throw error;
  },

  async restore(placeId: string): Promise<void> {
    const { error } = await supabase.rpc('restore_hidden_place', { p_place_id: placeId });
    if (error) throw error;
  },
};
