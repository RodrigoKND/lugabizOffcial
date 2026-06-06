import { useRef, useEffect, useCallback } from 'react';
import { Event } from '@domain/entities';
import { eventViewsService } from '@lib/supabase';

export function useEventViewTracker(
  user: { id: string } | null | undefined,
  events: Event[],
  currentIndex: number,
  loading: boolean,
) {
  const viewedRef = useRef<Set<string>>(new Set());

  const markCurrentViewed = useCallback((idx: number) => {
    if (!user || !events[idx]) return;
    const id = events[idx].id;
    if (viewedRef.current.has(id)) return;
    viewedRef.current.add(id);
    eventViewsService.markAsViewed(id, user.id).catch(() => {});
  }, [user, events]);

  useEffect(() => {
    if (events.length > 0 && !loading) {
      markCurrentViewed(currentIndex);
    }
  }, [currentIndex, events, loading, markCurrentViewed]);
}
