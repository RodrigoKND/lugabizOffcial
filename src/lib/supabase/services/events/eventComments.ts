import { supabase } from '@lib/supabase';

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  parentId?: string;
  text: string;
  likes: number;
  isOrganizer: boolean;
  createdAt: Date;
  replies?: EventComment[];
}

export const eventCommentsService = {
  async getComments(eventId: string): Promise<EventComment[]> {
    const { data, error } = await supabase
      .from('event_comments')
      .select(`
        *,
        user:users(name, avatar),
        event:events(user_id)
      `)
      .eq('event_id', eventId)
      .is('parent_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const comments = await Promise.all(
      (data || []).map(async (item: any) => {
        const replies = await this.getReplies(item.id);
        return {
          id: item.id,
          eventId: item.event_id,
          userId: item.user_id,
          userName: item.user?.name || 'Usuario',
          userAvatar: item.user?.avatar,
          parentId: item.parent_id,
          text: item.text,
          likes: item.likes || 0,
          isOrganizer: item.event?.user_id === item.user_id,
          createdAt: new Date(item.created_at),
          replies,
        };
      })
    );

    return comments;
  },

  async getReplies(commentId: string): Promise<EventComment[]> {
    const { data, error } = await supabase
      .from('event_comments')
      .select(`
        *,
        user:users(name, avatar),
        event:events(user_id)
      `)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      eventId: item.event_id,
      userId: item.user_id,
      userName: item.user?.name || 'Usuario',
      userAvatar: item.user?.avatar,
      parentId: item.parent_id,
      text: item.text,
      likes: item.likes || 0,
      isOrganizer: item.event?.user_id === item.user_id,
      createdAt: new Date(item.created_at),
    }));
  },

  async addComment(eventId: string, userId: string, text: string, parentId?: string): Promise<EventComment> {
    const { data, error } = await supabase
      .from('event_comments')
      .insert({
        event_id: eventId,
        user_id: userId,
        parent_id: parentId || null,
        text,
        likes: 0,
      })
      .select()
      .single();

    if (error) throw error;

    const userData = await supabase
      .from('users')
      .select('name, avatar')
      .eq('id', userId)
      .single();

    const eventData = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    return {
      id: data.id,
      eventId: data.event_id,
      userId: data.user_id,
      userName: userData.data?.name || 'Usuario',
      userAvatar: userData.data?.avatar,
      parentId: data.parent_id,
      text: data.text,
      likes: data.likes || 0,
      isOrganizer: eventData.data?.user_id === userId,
      createdAt: new Date(data.created_at),
    };
  },
};
