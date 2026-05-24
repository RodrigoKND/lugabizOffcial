import { useState, useEffect, useCallback } from 'react';
import { eventCommentsService, EventComment } from '@lib/supabase/services/events/eventComments';

export function useEventComments(eventId: string) {
  const [comments, setComments] = useState<EventComment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    try {
      const data = await eventCommentsService.getComments(eventId);
      setComments(data);
    } catch (e) {
      console.error('Error loading comments:', e);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = useCallback(async (userId: string, text: string, parentId?: string) => {
    try {
      const comment = await eventCommentsService.addComment(eventId, userId, text, parentId);
      if (parentId) {
        setComments(prev =>
          prev.map(c =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), comment] }
              : c
          )
        );
      } else {
        setComments(prev => [comment, ...prev]);
      }
    } catch (e) {
      console.error('Error adding comment:', e);
      throw e;
    }
  }, [eventId]);

  return { comments, loading, addComment, refresh: loadComments };
}
