import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { eventsService } from '@lib/supabase';
import { useAuth } from '@presentation/context';
import { Calendar } from 'lucide-react';

const CHECK_INTERVAL = 60000;
const NOTIFY_WINDOW_MINUTES = 60;

export function useEventNotifications() {
  const { user } = useAuth();
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    const check = async () => {
      try {
        const events = await eventsService.getEvents();
        const now = new Date();

        for (const event of events) {
          if (notifiedRef.current.has(event.id)) continue;

          const eventTime = new Date(event.dateStart);
          const diffMs = eventTime.getTime() - now.getTime();
          const diffMinutes = diffMs / 60000;

          if (diffMinutes > 0 && diffMinutes <= NOTIFY_WINDOW_MINUTES) {
            notifiedRef.current.add(event.id);

            const timeStr = eventTime.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Evento próximo!', {
                body: `${event.name} - ${timeStr} en ${event.address}`,
                icon: event.image || '/L.ico',
              });
            }

            toast(
              (t) => (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-stone-800">Evento próximo!</p>
                    <p className="text-xs text-stone-500 mt-0.5">{event.name}</p>
                    <p className="text-[11px] text-stone-400">{timeStr} - {event.address}</p>
                    <button onClick={() => { toast.dismiss(t.id); }}
                      className="mt-2 text-xs font-semibold text-amber-600 hover:text-amber-700">
                      Ver evento
                    </button>
                  </div>
                </div>
              ),
              { duration: 8000 }
            );
          }
        }
      } catch (err){ console.log(err instanceof Error ? err.message : ""); }
    };

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    check();
    const interval = setInterval(check, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [user]);
}
