import { useState, useEffect, useCallback } from 'react';
import { eventSavesService } from '@lib/supabase/services/events/eventSaves';

export function useEventSaves(eventId: string, userId?: string) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) { setLoading(false); return; }
      try {
        const status = await eventSavesService.getSave(eventId, userId);
        setSaved(status);
      } catch (e) {
        console.error('Error loading save status:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId, userId]);

  const toggleSave = useCallback(async () => {
    if (!userId) return;
    try {
      const newStatus = await eventSavesService.toggleSave(eventId, userId);
      setSaved(newStatus);
    } catch (e) {
      console.error('Error toggling save:', e);
    }
  }, [eventId, userId]);

  return { saved, loading, toggleSave };
}
