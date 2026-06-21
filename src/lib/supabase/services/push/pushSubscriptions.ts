import { supabase } from '@lib/supabase/client';

export const pushSubscriptionsService = {
  async save(userId: string, subscription: PushSubscription): Promise<void> {
    // Upsert por endpoint: permite múltiples dispositivos por usuario.
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        subscription: JSON.parse(JSON.stringify(subscription)),
      }, { onConflict: 'endpoint' });
    if (error) throw error;
  },

  async getByUserIds(userIds: string[]): Promise<any[]> {
    if (userIds.length === 0) return [];
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds);
    if (error) throw error;
    return data || [];
  },

  async remove(userId: string): Promise<void> {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', userId);
  },
};