import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Event } from '@domain/entities';
import { eventViewsService } from '@lib/supabase';
import { UseHomeEventsReturn } from '@domain/entities/HomeTypes';

export function useHomeEvents(events: Event[], userId?: string): UseHomeEventsReturn {
  const [viewedEvents, setViewedEvents] = useState<Set<string>>(new Set());
  const [heroIndex, setHeroIndex] = useState(0);
  const heroTimer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!userId) return;
    eventViewsService.getViewedEventIds(userId).then(ids => {
      setViewedEvents(new Set(ids));
    }).catch(() => {});
  }, [userId]);

  const markEventViewed = useCallback((eventId: string) => {
    if (!userId) return;
    if (viewedEvents.has(eventId)) return;
    eventViewsService.markAsViewed(eventId, userId).catch(() => {});
    setViewedEvents(prev => new Set(prev).add(eventId));
  }, [userId, viewedEvents]);

  const activeEvents = useMemo(() => {
    // La query ya filtra date_start >= hoy en UTC.
    // Filtramos también en cliente por si hubiera datos en caché del contexto.
    const todayStr = new Date().toISOString().slice(0, 10);
    return events.filter(e => {
      const d = e.dateStart instanceof Date
        ? e.dateStart.toISOString().slice(0, 10)
        : String(e.dateStart).slice(0, 10);
      return d >= todayStr;
    });
  }, [events]);

  const heroEvent = useMemo(
    () => activeEvents.length > 0 ? activeEvents[heroIndex % activeEvents.length] : null,
    [activeEvents, heroIndex]
  );

  useEffect(() => {
    if (activeEvents.length <= 1) return;
    heroTimer.current = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % activeEvents.length);
    }, 6000);
    return () => clearInterval(heroTimer.current);
  }, [activeEvents.length]);

  return {
    activeEvents,
    heroEvent,
    heroIndex,
    setHeroIndex,
    viewedEvents,
    markEventViewed,
  };
}
