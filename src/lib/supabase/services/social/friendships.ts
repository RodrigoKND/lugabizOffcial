import { supabase } from '@lib/supabase/client';
import { Friendship, FriendshipStatus, FriendOption, UserSearchResult } from '@domain/entities';
import { edgeService } from '@lib/supabase/services/notifications/edgeFunctions';

interface FriendOptionRow {
  friendship_id: string;
  user_id: string;
  name: string;
  username?: string;
  avatar?: string;
}

interface UserLite {
  id: string;
  name: string;
  avatar?: string;
  username?: string;
}

interface FriendshipRow {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  responded_at?: string;
}

// Los FK de friendships apuntan a auth.users, no a public.users: PostgREST no
// puede embeder ahí (mismo problema ya visto con owner_verifications). Se
// resuelven los nombres con una consulta aparte a public.users y se mapean acá.
async function fetchUsersLite(ids: string[]): Promise<Map<string, UserLite>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar, username')
    .in('id', ids);
  if (error) throw error;
  return new Map((data || []).map((u) => [u.id, u as UserLite]));
}

function mapFriendship(row: FriendshipRow, viewerId: string, usersMap: Map<string, UserLite>): Friendship {
  const otherId = row.requester_id === viewerId ? row.addressee_id : row.requester_id;
  const other = usersMap.get(otherId);
  return {
    id: row.id,
    requesterId: row.requester_id,
    addresseeId: row.addressee_id,
    status: row.status,
    createdAt: new Date(row.created_at),
    respondedAt: row.responded_at ? new Date(row.responded_at) : undefined,
    otherUserId: otherId,
    otherUserName: other?.name || 'Usuario',
    otherUserUsername: other?.username,
    otherUserAvatar: other?.avatar,
  };
}

export const friendshipsService = {
  async searchUsers(query: string): Promise<UserSearchResult[]> {
    const { data, error } = await supabase.rpc('search_users_by_username', { p_query: query });
    if (error) throw error;
    return (data || []) as UserSearchResult[];
  },

  // Filtro+límite resuelto en SQL (search_my_friends): funciona igual de rápido
  // con 5 o 500 amigos, nunca trae la lista completa al cliente para filtrarla ahí.
  async searchFriends(query: string, limit = 20): Promise<FriendOption[]> {
    const { data, error } = await supabase.rpc('search_my_friends', { p_query: query, p_limit: limit });
    if (error) throw error;
    return ((data || []) as FriendOptionRow[]).map((r) => ({
      friendshipId: r.friendship_id,
      userId: r.user_id,
      name: r.name,
      username: r.username,
      avatar: r.avatar,
    }));
  },

  async sendRequest(requesterId: string, addresseeId: string): Promise<void> {
    const { data, error } = await supabase
      .from('friendships')
      .insert({ requester_id: requesterId, addressee_id: addresseeId })
      .select('id')
      .single();
    if (error) throw error;
    edgeService.sendFriendRequestPush(data.id).catch(() => {});
  },

  async respondToRequest(friendshipId: string, accept: boolean): Promise<void> {
    const { error } = await supabase
      .from('friendships')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', friendshipId);
    if (error) throw error;
    if (accept) edgeService.sendFriendAcceptPush(friendshipId).catch(() => {});
  },

  async removeFriendship(friendshipId: string): Promise<void> {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
    if (error) throw error;
  },

  async listPendingRequests(userId: string): Promise<Friendship[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'pending')
      .eq('addressee_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []) as FriendshipRow[];
    const usersMap = await fetchUsersLite(rows.map((r) => r.requester_id));
    return rows.map((r) => mapFriendship(r, userId, usersMap));
  },

  async listSentRequests(userId: string): Promise<Friendship[]> {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'pending')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const rows = (data || []) as FriendshipRow[];
    const usersMap = await fetchUsersLite(rows.map((r) => r.addressee_id));
    return rows.map((r) => mapFriendship(r, userId, usersMap));
  },

  async blockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase.from('blocked_users').insert({ blocker_id: blockerId, blocked_id: blockedId });
    if (error) throw error;
  },

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', blockerId)
      .eq('blocked_id', blockedId);
    if (error) throw error;
  },
};
