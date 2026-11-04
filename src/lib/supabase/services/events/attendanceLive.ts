import { supabase } from '@lib/supabase';
import { getAttendeeCount } from './eventsStatus';

// Avisa el conteo actualizado de "Voy" cada vez que alguien confirma o cancela. Devuelve la función para cerrar el canal.
export function subscribeAttendanceCount(eventId: string, onCount: (count: number) => void): () => void {
  const channel = supabase
    .channel(`event-going-${eventId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'event_attendance',
      filter: `event_id=eq.${eventId}`,
    }, () => {
      getAttendeeCount(eventId).then(onCount).catch(() => {});
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
