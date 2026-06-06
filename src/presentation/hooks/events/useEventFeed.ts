import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Event } from '@domain/entities';
import { eventsService } from '@lib/supabase';

export function useEventFeed() {
  const [searchParams] = useSearchParams();
  const startId = searchParams.get('start');

  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentEventId, setCommentEventId] = useState<string | null>(null);

  useEffect(() => {
    eventsService.getEvents().then((data) => {
      setEvents(data);
      if (startId) {
        const idx = data.findIndex((e) => e.id === startId);
        if (idx >= 0) setCurrentIndex(idx);
      }
    }).finally(() => setLoading(false));
  }, [startId]);

  const goNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, events.length - 1));
  }, [events.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, []);

  return {
    events,
    currentIndex,
    loading,
    commentEventId,
    setCurrentIndex,
    setCommentEventId,
    goNext,
    goPrev,
    startId,
  };
}
