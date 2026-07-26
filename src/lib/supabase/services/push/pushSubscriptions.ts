import { supabase } from '@lib/supabase/client';

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  subscription: Record<string, unknown>;
  created_at: string;
}

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

  /** Guarda un token de Firebase Cloud Messaging (reemplaza gradualmente a `save`). */
  async saveFcmToken(userId: string, token: string): Promise<void> {
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        fcm_token: token,
        provider: 'fcm',
      }, { onConflict: 'fcm_token' });
    if (error) throw error;
  },

  async getByUserIds(userIds: string[]): Promise<PushSubscriptionRow[]> {
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