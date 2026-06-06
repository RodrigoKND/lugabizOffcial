import { supabase } from '@lib/supabase';
import { PlaceShareConfirmation } from '@domain/entities';

export interface PlaceShare {
  id: string;
  placeId: string;
  sharedBy: string;
  sharedUrl: string;
  createdAt: Date;
}

export const placeSharesService = {
  async createShare(placeId: string, sharedBy: string): Promise<PlaceShare> {
    const shareId = crypto.randomUUID();
    const sharedUrl = `${window.location.origin}/share/place/${shareId}`;

    const { data, error } = await supabase
      .from('place_shares')
      .insert({
        id: shareId,
        place_id: placeId,
        shared_by: sharedBy,
        shared_url: sharedUrl,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      placeId: data.place_id,
      sharedBy: data.shared_by,
      sharedUrl: data.shared_url,
      createdAt: new Date(data.created_at),
    };
  },

  async getShareById(shareId: string): Promise<PlaceShare | null> {
    const { data, error } = await supabase
      .from('place_shares')
      .select('*')
      .eq('id', shareId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      placeId: data.place_id,
      sharedBy: data.shared_by,
      sharedUrl: data.shared_url,
      createdAt: new Date(data.created_at),
    };
  },

  async getSharesByUser(userId: string): Promise<PlaceShare[]> {
    const { data, error } = await supabase
      .from('place_shares')
      .select('*')
      .eq('shared_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      placeId: item.place_id,
      sharedBy: item.shared_by,
      sharedUrl: item.shared_url,
      createdAt: new Date(item.created_at),
    }));
  },

  async confirmShare(shareId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('place_share_confirmations')
      .upsert({
        share_id: shareId,
        user_id: userId,
        confirmed: true,
      }, { onConflict: 'share_id,user_id' });

    if (error) throw error;
  },

  async getConfirmations(shareId: string): Promise<PlaceShareConfirmation[]> {
    const { data, error } = await supabase
      .from('place_share_confirmations')
      .select(`
        *,
        user:users(id, name, avatar)
      `)
      .eq('share_id', shareId);

    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      shareId: c.share_id,
      userId: c.user_id,
      userName: c.user?.name || 'Usuario',
      userAvatar: c.user?.avatar,
      confirmed: c.confirmed,
      createdAt: new Date(c.created_at),
    }));
  },

  async getConfirmationsForUser(userId: string): Promise<PlaceShareConfirmation[]> {
    const { data, error } = await supabase
      .from('place_share_confirmations')
      .select(`
        *,
        share:place_shares!inner(place_id, shared_by, created_at)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      shareId: c.share_id,
      userId: c.user_id,
      userName: c.user?.name || 'Usuario',
      userAvatar: c.user?.avatar,
      confirmed: c.confirmed,
      createdAt: new Date(c.created_at),
    }));
  },

  async subscribeToConfirmations(shareId: string, callback: () => void) {
    const subscription = supabase
      .channel(`place-confirmations-${shareId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'place_share_confirmations',
        filter: `share_id=eq.${shareId}`,
      }, () => callback())
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  },
};
