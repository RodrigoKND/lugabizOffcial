import { supabase } from '@lib/supabase';

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  data?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  createdAt: string;
}

export const userActivityService = {
  async trackAction(userId: string, action: string, data?: Record<string, unknown>) {
    const payload: Record<string, unknown> = {
      user_id: userId,
      action,
      data: data || {},
      user_agent: navigator.userAgent,
      session_id: sessionStorage.getItem('_lugabiz_s') || crypto.randomUUID(),
    };

    const { error } = await supabase.from('user_activity').insert(payload);
    if (error) console.error('Error tracking action:', error);
  },

  async trackView(userId: string, targetType: string, targetId: string) {
    return this.trackAction(userId, `view_${targetType}`, { [targetType]: targetId });
  },

  async trackSearch(userId: string, query: string) {
    return this.trackAction(userId, 'search', { query });
  },

  async trackInteraction(userId: string, targetType: string, targetId: string, interaction: string) {
    return this.trackAction(userId, interaction, { [targetType]: targetId });
  },

  async trackLocation(userId: string, latitude: number, longitude: number) {
    const { data: nearby } = await supabase.rpc('find_nearby_places', {
      lat: latitude,
      lon: longitude,
      radius_km: 1,
    });

    await this.trackAction(userId, 'location_update', {
      latitude,
      longitude,
      nearby_places: nearby || [],
    });

    if (nearby && nearby.length > 0) {
      const { data: existing } = await supabase
        .from('notifications')
        .select('id, data')
        .eq('user_id', userId)
        .eq('type', 'nearby')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString());

      const existingIds = new Set<string>();
      (existing || []).forEach(n => {
        const pid = n.data?.place_id;
        if (pid) existingIds.add(pid);
      });

      const inserts = nearby
        .filter((p: any) => !existingIds.has(p.id))
        .map((p: any) => ({
          user_id: userId,
          type: 'nearby' as const,
          title: p.name,
          body: `Estás pasando cerca · ¿Entraste? Cuéntanos qué te pareció`,
          data: {
            place_id: p.id,
            place_name: p.name,
            latitude,
            longitude,
            url: `/places/${p.id}?survey=true`,
          },
        }));

      if (inserts.length > 0) {
        await supabase.from('notifications').insert(inserts);
      }
    }
  },

  async getRecentActivity(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id,
      userId: a.user_id,
      action: a.action,
      data: a.data,
      ipAddress: a.ip_address,
      userAgent: a.user_agent,
      sessionId: a.session_id,
      createdAt: a.created_at,
    })) as UserActivity[];
  },
};
