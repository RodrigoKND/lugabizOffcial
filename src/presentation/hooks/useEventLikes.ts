import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { eventLikesService } from '@lib/supabase/services/events/eventLikes';

export function useEventLikes(eventId: string, userId?: string) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [count, likeStatus] = await Promise.all([
          eventLikesService.getLikesCount(eventId),
          userId ? eventLikesService.getLike(eventId, userId) : Promise.resolve(false),
        ]);
        setLikesCount(count);
        setLiked(likeStatus);
      } catch (e) {
        console.error('Error loading likes:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId, userId]);

  const toggleLike = useCallback(async () => {
    if (!userId) {
      toast.error('Inicia sesión para dar like');
      return;
    }
    try {
      const result = await eventLikesService.toggleLike(eventId, userId);
      setLiked(result.liked);
      setLikesCount(result.count);
    } catch (e) {
      console.error('Error toggling like:', e);
      toast.error('Error al actualizar like');
    }
  }, [eventId, userId]);

  return { liked, likesCount, loading, toggleLike };
}
