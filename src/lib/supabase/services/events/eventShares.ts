import { supabase } from '@lib/supabase';
import { EventShare } from '@domain/entities';

export const eventSharesService = {
  async createShare(eventId: string, sharedBy: string): Promise<EventShare> {
    const shareId = crypto.randomUUID();
    const sharedUrl = `${window.location.origin}/event/${eventId}?ref=${shareId}`;

    const { data, error } = await supabase
      .from('event_shares')
      .insert({
        id: shareId,
        event_id: eventId,
        shared_by: sharedBy,
        shared_url: sharedUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      eventId: data.event_id,
      sharedBy: data.shared_by,
      sharedUrl: data.shared_url,
      createdAt: new Date(data.created_at),
    };
  },

  async getShareByUrl(sharedUrl: string): Promise<EventShare | null> {
    const { data, error } = await supabase
      .from('event_shares')
      .select('*')
      .eq('shared_url', sharedUrl)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      eventId: data.event_id,
      sharedBy: data.shared_by,
      sharedUrl: data.shared_url,
      createdAt: new Date(data.created_at),
    };
  },

  async getSharesByUser(userId: string): Promise<EventShare[]> {
    const { data, error } = await supabase
      .from('event_shares')
      .select('*')
      .eq('shared_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      eventId: item.event_id,
      sharedBy: item.shared_by,
      sharedUrl: item.shared_url,
      createdAt: new Date(item.created_at),
    }));
  },

  async attendWithShare(eventId: string, userId: string, shareId?: string): Promise<void> {
    let sharedBy: string | undefined;

    if (shareId) {
      const { data } = await supabase
        .from('event_shares')
        .select('shared_by')
        .eq('id', shareId)
        .maybeSingle();

      sharedBy = data?.shared_by;
    }

    const { error } = await supabase
      .from('event_attendance')
      .upsert({
        user_id: userId,
        event_id: eventId,
        shared_by: sharedBy,
        confirmed: true,
      }, { onConflict: 'event_id,user_id' });

    if (error) throw error;
  },
};
