import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { eventsService } from '@lib/supabase/services/events';
import { subscribeAttendanceCount } from '@lib/supabase/services/events/attendanceLive';

// "Voy" con conteo en vivo: toggle optimista, se revierte si falla y se actualiza cuando otros confirman.
export function useEventGoing(eventId: string, userId: string | undefined, initialCount: number) {
  const [going, setGoing] = useState(false);
  const [count, setCount] = useState(initialCount);
  const touched = useRef(false);

  useEffect(() => { setCount(initialCount); }, [initialCount]);

  useEffect(() => {
    if (!userId) { setGoing(false); return; }
    let active = true;
    touched.current = false;
    eventsService.isAttending(userId, eventId)
      .then(v => { if (active && !touched.current) setGoing(v); })
      .catch(() => {});
    return () => { active = false; };
  }, [eventId, userId]);

  useEffect(() => subscribeAttendanceCount(eventId, setCount), [eventId]);

  const toggle = useCallback(async () => {
    if (!userId) { toast.error('Inicia sesión para decir "Voy"'); return; }
    const next = !going;
    touched.current = true;
    setGoing(next);
    setCount(c => Math.max(0, c + (next ? 1 : -1)));
    try {
      if (next) await eventsService.attendEvent(userId, eventId);
      else await eventsService.cancelAttendance(userId, eventId);
    } catch {
      setGoing(!next);
      setCount(c => Math.max(0, c + (next ? -1 : 1)));
      toast.error('No se pudo actualizar, intenta de nuevo');
    }
  }, [going, userId, eventId]);

  return { going, count, toggle };
}
