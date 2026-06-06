import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
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
      const dbComment = await eventCommentsService.addComment(eventId, userId, text, parentId);
      if (parentId) {
        setComments(prev =>
          prev.map(c =>
            c.id === parentId
              ? { ...c, replies: [...(c.replies || []), dbComment] }
              : c
          )
        );
      } else {
        setComments(prev => [dbComment, ...prev]);
      }
      return dbComment;
    } catch (e) {
      console.error('Error adding comment:', e);
      toast.error('Error al enviar comentario');
      throw e;
    }
  }, [eventId]);

  return { comments, loading, addComment, refresh: loadComments };
}
