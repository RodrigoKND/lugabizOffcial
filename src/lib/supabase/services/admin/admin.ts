import { supabase } from '@lib/supabase';

export const adminService = {
  async getStats(): Promise<{
    users: number;
    places: number;
    events: number;
    reviews: number;
    surveys: number;
    notifications: number;
  }> {
    const [users, places, events, reviews, surveys, notifications] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('places').select('id', { count: 'exact', head: true }),
      supabase.from('events').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('place_surveys').select('id', { count: 'exact', head: true }),
      supabase.from('notifications').select('id', { count: 'exact', head: true }),
    ]);

    return {
      users: users.count || 0,
      places: places.count || 0,
      events: events.count || 0,
      reviews: reviews.count || 0,
      surveys: surveys.count || 0,
      notifications: notifications.count || 0,
    };
  },

  async getRecentActivity(): Promise<any[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, user:users(name)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  },

  async getUserRole(userId: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.role || null;
  },

  async setUserRole(userId: string, role: 'admin' | 'owner' | 'user'): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

    if (error) throw error;
  },
};
