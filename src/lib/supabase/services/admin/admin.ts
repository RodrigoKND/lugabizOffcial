import { supabase } from '@lib/supabase';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';
import { userActivityService } from '@lib/supabase/services/places/userActivity';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  banned: boolean;
  ban_reason?: string;
  role?: string;
  created_at: string;
}

interface ModItem {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  image?: string;
  user_name?: string;
  user_avatar?: string;
  author_id?: string;
  created_at: string;
}

export const adminService = {
  async getStats(): Promise<{
    users: number;
    places: number;
    events: number;
    reviews: number;
    surveys: number;
    notifications: number;
  }> {
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error) throw error;

    const stats = { users: 0, places: 0, events: 0, reviews: 0, surveys: 0, notifications: 0 };
    (data || []).forEach((row: { name: string; count: number }) => {
      if (row.name in stats) (stats as any)[row.name] = row.count;
    });
    return stats;
  },

  async getRecentActivity(): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('get_admin_recent_activity', { limit_count: 20 });

    if (error) throw error;
    return data || [];
  },

  async getUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar, banned, ban_reason, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const userIds = (data || []).map(u => u.id);
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));

    return (data || []).map(u => ({
      ...u,
      banned: u.banned ?? false,
      role: roleMap.get(u.id) || 'user',
    }));
  },

  async banUser(userId: string, reason: string): Promise<void> {
    const bannedAt = new Date().toISOString();
    const { data: { user: admin } } = await supabase.auth.getUser();

    await supabase.from('users').update({ banned: true, ban_reason: reason }).eq('id', userId);
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      title: 'Cuenta suspendida',
      body: `Tu cuenta ha sido suspendida. Motivo: ${reason}`,
      data: { ban_reason: reason, banned_at: bannedAt, banned_by: admin?.id },
    });

    // Audit log permanente del evento de baneo
    if (admin?.id) {
      userActivityService.trackAction(admin.id, 'ban_user', {
        target_user_id: userId,
        reason,
        banned_at: bannedAt,
        source: 'admin_manual',
      }).catch(() => {});
    }

    edgeService.banUserWithPush(userId, reason).catch(() => {});
  },

  async unbanUser(userId: string): Promise<void> {
    const { data: { user: admin } } = await supabase.auth.getUser();
    const unbannedAt = new Date().toISOString();

    await supabase.from('users').update({ banned: false, ban_reason: null }).eq('id', userId);

    if (admin?.id) {
      userActivityService.trackAction(admin.id, 'unban_user', {
        target_user_id: userId,
        unbanned_at: unbannedAt,
      }).catch(() => {});
    }
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

  async getAllPlaces(): Promise<ModItem[]> {
    const { data, error } = await supabase
      .from('places')
      .select('id, name, description, image, author_id, created_at, author:users(name, avatar)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      image: p.image,
      author_id: p.author_id,
      created_at: p.created_at,
      user_name: p.author?.name || 'Usuario',
      user_avatar: p.author?.avatar,
    }));
  },

  async getAllEvents(): Promise<ModItem[]> {
    const { data, error } = await supabase
      .from('events')
      .select('id, name, user_id, created_at, author:users(name)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      author_id: p.user_id,
      created_at: p.created_at,
      user_name: p.author?.name || 'Usuario',
    }));
  },

  async getAllReviews(): Promise<any[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, comment, rating, user_id, place_id, created_at, user:users(name, banned, ban_reason)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const reviews = (data || []).map(r => ({
      ...r,
      user_name: r.user?.name || 'Usuario',
      user_banned: r.user?.banned || false,
      user_ban_reason: r.user?.ban_reason || null,
    }));

    const ids = reviews.map(r => r.id);
    const { data: reportCounts } = await supabase
      .from('reports')
      .select('target_id, count:target_id(count)')
      .in('target_id', ids.length > 0 ? ids : ['none'])
      .eq('target_type', 'review');

    const reportMap = new Map((reportCounts || []).map((r: any) => [r.target_id, Number(r.count) || 0]));

    return reviews.map(r => ({ ...r, report_count: reportMap.get(r.id) || 0 }));
  },

  async deletePlace(placeId: string): Promise<void> {
    await supabase.from('places').delete().eq('id', placeId);
  },

  async deleteEvent(eventId: string): Promise<void> {
    await supabase.from('events').delete().eq('id', eventId);
  },

  async deleteReview(reviewId: string): Promise<void> {
    await supabase.from('reviews').delete().eq('id', reviewId);
  },

  async banUserFromContent(
    userId: string,
    reason: string,
    targetInfo: { targetId: string; targetType: string; content?: string } | string,
  ): Promise<void> {
    const bannedAt = new Date().toISOString();
    const { data: { user: admin } } = await supabase.auth.getUser();
    const infoLabel = typeof targetInfo === 'string'
      ? targetInfo
      : `${targetInfo.targetType} (${targetInfo.targetId})`;
    const infoData = typeof targetInfo === 'string' ? { target_info: targetInfo } : targetInfo;

    await supabase.from('users').update({ banned: true, ban_reason: reason }).eq('id', userId);
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      title: 'Cuenta suspendida',
      body: `Tu cuenta ha sido suspendida por contenido inapropiado. Motivo: ${reason}`,
      data: { ban_reason: reason, target_info: infoLabel, banned_at: bannedAt, banned_by: admin?.id },
    });

    if (admin?.id) {
      userActivityService.trackAction(admin.id, 'ban_user', {
        target_user_id: userId,
        reason,
        banned_at: bannedAt,
        source: 'admin_content',
        ...infoData,
      }).catch(() => {});
    }

    edgeService.banUserWithPush(userId, reason).catch(() => {});
  },

  async getAdvancedStats(): Promise<{
    banned: number;
    owners: number;
    activeOwners: number;
    onlineUsers: number;
    surveysTotal: number;
  }> {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [bannedRes, ownersRes, onlineRes, surveysRes, recentPlacesRes, recentEventsRes] = await Promise.allSettled([
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('banned', true),
      supabase.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('role', 'owner'),
      // Use SECURITY DEFINER RPC to bypass RLS on user_activity
      supabase.rpc('get_online_users_count', { minutes_back: 10 }),
      supabase.from('market_surveys').select('id', { count: 'exact', head: true }),
      supabase.from('places').select('author_id').gte('created_at', thirtyDaysAgo).limit(200),
      supabase.from('events').select('user_id').gte('created_at', thirtyDaysAgo).limit(200),
    ]);

    const banned = bannedRes.status === 'fulfilled' ? (bannedRes.value.count ?? 0) : 0;
    const owners = ownersRes.status === 'fulfilled' ? (ownersRes.value.count ?? 0) : 0;
    const surveysTotal = surveysRes.status === 'fulfilled' ? (surveysRes.value.count ?? 0) : 0;
    const onlineUsers = onlineRes.status === 'fulfilled' ? (onlineRes.value.data ?? 0) : 0;

    const recentAuthorIds = new Set<string>();
    if (recentPlacesRes.status === 'fulfilled') {
      (recentPlacesRes.value.data || []).forEach((r: any) => recentAuthorIds.add(r.author_id));
    }
    if (recentEventsRes.status === 'fulfilled') {
      (recentEventsRes.value.data || []).forEach((r: any) => recentAuthorIds.add(r.user_id));
    }
    const activeOwners = Math.min(owners, recentAuthorIds.size);

    return { banned, owners, activeOwners, onlineUsers, surveysTotal };
  },

  async getGrowthData(): Promise<Array<{ month: string; users: number; places: number; events: number }>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    const since = sixMonthsAgo.toISOString();

    const [usersRes, placesRes, eventsRes] = await Promise.allSettled([
      supabase.from('users').select('created_at').gte('created_at', since),
      supabase.from('places').select('created_at').gte('created_at', since),
      supabase.from('events').select('created_at').gte('created_at', since),
    ]);

    const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const months: Record<string, { month: string; users: number; places: number; events: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: MONTH_NAMES[d.getMonth()], users: 0, places: 0, events: 0 };
    }

    const bucket = (ds: string) => {
      const d = new Date(ds);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    };

    if (usersRes.status === 'fulfilled') {
      (usersRes.value.data || []).forEach((r: any) => {
        const k = bucket(r.created_at);
        if (months[k]) months[k].users++;
      });
    }
    if (placesRes.status === 'fulfilled') {
      (placesRes.value.data || []).forEach((r: any) => {
        const k = bucket(r.created_at);
        if (months[k]) months[k].places++;
      });
    }
    if (eventsRes.status === 'fulfilled') {
      (eventsRes.value.data || []).forEach((r: any) => {
        const k = bucket(r.created_at);
        if (months[k]) months[k].events++;
      });
    }

    return Object.values(months);
  },

  async getCategoryDistribution(): Promise<Array<{ name: string; color: string; places: number; events: number; total: number }>> {
    const [placesRes, eventsRes] = await Promise.allSettled([
      supabase.from('places').select('category:categories(id, name, color)').limit(500),
      supabase.from('events').select('category:categories(id, name, color)').limit(500),
    ]);

    const dist: Record<string, { name: string; color: string; places: number; events: number }> = {};

    if (placesRes.status === 'fulfilled') {
      (placesRes.value.data || []).forEach((r: any) => {
        const cat = r.category;
        if (!cat?.id) return;
        if (!dist[cat.id]) dist[cat.id] = { name: cat.name, color: cat.color || '#f59e0b', places: 0, events: 0 };
        dist[cat.id].places++;
      });
    }
    if (eventsRes.status === 'fulfilled') {
      (eventsRes.value.data || []).forEach((r: any) => {
        const cat = r.category;
        if (!cat?.id) return;
        if (!dist[cat.id]) dist[cat.id] = { name: cat.name, color: cat.color || '#f59e0b', places: 0, events: 0 };
        dist[cat.id].events++;
      });
    }

    return Object.values(dist)
      .map(c => ({ ...c, total: c.places + c.events }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  },

  async getSocialGroupsDistribution(): Promise<Array<{ name: string; color: string; places: number; total: number }>> {
    const { data, error } = await supabase
      .from('place_social_groups')
      .select('social_group:social_groups(id, name, color)')
      .limit(500);

    if (error) return [];

    const dist: Record<string, { name: string; color: string; places: number }> = {};
    (data || []).forEach((r: any) => {
      const sg = r.social_group;
      if (!sg?.id) return;
      if (!dist[sg.id]) dist[sg.id] = { name: sg.name, color: sg.color || '#8b5cf6', places: 0 };
      dist[sg.id].places++;
    });

    return Object.values(dist)
      .map(c => ({ ...c, total: c.places }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  },

  async getBusinessOwnerActivity(): Promise<Array<{
    userId: string;
    name: string;
    avatar?: string;
    placesCount: number;
    eventsCount: number;
    lastActivity?: string;
    isActive: boolean;
  }>> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: ownerRoles } = await supabase
      .from('user_roles')
      .select('user_id, user:users(id, name, avatar)')
      .eq('role', 'owner')
      .limit(30);

    if (!ownerRoles?.length) return [];
    const ownerIds = ownerRoles.map((r: any) => r.user_id);

    const [placesRes, eventsRes, activityRes] = await Promise.allSettled([
      supabase.from('places').select('author_id, created_at').in('author_id', ownerIds),
      supabase.from('events').select('user_id, created_at').in('user_id', ownerIds),
      // Use SECURITY DEFINER RPC to bypass user_activity RLS
      supabase.rpc('get_users_last_activity', {
        p_user_ids: ownerIds,
        since: thirtyDaysAgo,
      }),
    ]);

    const placesByOwner: Record<string, number> = {};
    const recentPlace: Record<string, boolean> = {};
    if (placesRes.status === 'fulfilled') {
      (placesRes.value.data || []).forEach((r: any) => {
        placesByOwner[r.author_id] = (placesByOwner[r.author_id] || 0) + 1;
        if (r.created_at >= thirtyDaysAgo) recentPlace[r.author_id] = true;
      });
    }

    const eventsByOwner: Record<string, number> = {};
    const recentEvent: Record<string, boolean> = {};
    if (eventsRes.status === 'fulfilled') {
      (eventsRes.value.data || []).forEach((r: any) => {
        eventsByOwner[r.user_id] = (eventsByOwner[r.user_id] || 0) + 1;
        if (r.created_at >= thirtyDaysAgo) recentEvent[r.user_id] = true;
      });
    }

    const lastActivity: Record<string, string> = {};
    if (activityRes.status === 'fulfilled') {
      // RPC returns { user_id, last_activity }[]
      (activityRes.value.data || []).forEach((r: any) => {
        lastActivity[r.user_id] = r.last_activity;
      });
    }

    return ownerRoles
      .map((r: any) => {
        const uid = r.user_id;
        const user = r.user || {};
        return {
          userId: uid,
          name: user.name || 'Dueño',
          avatar: user.avatar,
          placesCount: placesByOwner[uid] || 0,
          eventsCount: eventsByOwner[uid] || 0,
          lastActivity: lastActivity[uid],
          isActive: !!(recentPlace[uid] || recentEvent[uid]),
        };
      })
      .sort((a, b) => (b.placesCount + b.eventsCount) - (a.placesCount + a.eventsCount));
  },

  async getUserEngagementMetrics(): Promise<{
    avgSessionMinutes: number;
    topAction: string;
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
  }> {
    // Use SECURITY DEFINER RPC to bypass RLS on user_activity
    const { data, error } = await supabase.rpc('get_admin_engagement_metrics');
    if (error || !data) {
      return { avgSessionMinutes: 0, topAction: 'page_view', dailyActiveUsers: 0, weeklyActiveUsers: 0 };
    }
    const m = typeof data === 'string' ? JSON.parse(data) : data;
    return {
      dailyActiveUsers: m.dailyActiveUsers ?? 0,
      weeklyActiveUsers: m.weeklyActiveUsers ?? 0,
      topAction: m.topAction ?? 'page_view',
      avgSessionMinutes: m.avgSessionMinutes ?? 0,
    };
  },
};
