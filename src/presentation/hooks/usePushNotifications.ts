import { useEffect, useRef } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@presentation/context';

// La clave PÚBLICA VAPID. DEBE ser exactamente la misma que el secret
// VITE_VAPID_PUBLIC_KEY del servidor (la usa la edge function para firmar el push) y su
// par privado (VAPID_PRIVATE_KEY) debe corresponder a ESTA pública. Si no coinciden, el
// navegador rechaza el push con 403. Se puede sobrescribir por env (Vercel) sin tocar código.
const PUBLIC_VAPID_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim() ||
  'BBfkqJL_-RpARKDGkzCuVCnEvPgcVgBlIPq9UCINWQmDHVrukbnOUR00wZaZJQETLD0t-Rkcp8X0b-wRDc_BGnk';

export function usePushNotifications() {
  const registered = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    if (registered.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (Notification.permission === 'denied') return;
    if (!user) return;

    const init = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        registered.current = true;

        const keyBytes = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
        let sub = await reg.pushManager.getSubscription();

        // Si ya hay una suscripción pero fue creada con OTRA clave pública (p. ej. se
        // rotaron las VAPID), hay que descartarla y volver a suscribir con la actual;
        // de lo contrario el servidor nunca podrá entregarle el push.
        if (sub && !appServerKeyMatches(sub, keyBytes)) {
          try { await sub.unsubscribe(); } catch { /* */ }
          sub = null;
        }

        if (!sub) {
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;
          }

          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: keyBytes,
          });
        }

        if (sub && user) {
          // Upsert por ENDPOINT (no por user_id): así un mismo usuario puede tener
          // varias suscripciones (móvil + desktop) sin que una sobrescriba a la otra.
          await supabase
            .from('push_subscriptions')
            .upsert({
              user_id: user.id,
              endpoint: sub.endpoint,
              subscription: JSON.parse(JSON.stringify(sub)),
            }, { onConflict: 'endpoint' });
        }
      } catch (err) {
        console.error('Push registration error:', err);
      }
    };

    init();
  }, [user]);
}

// ¿La suscripción existente fue creada con esta misma clave pública?
function appServerKeyMatches(sub: PushSubscription, keyBytes: Uint8Array): boolean {
  const existing = sub.options?.applicationServerKey;
  if (!existing) return false;
  const a = new Uint8Array(existing as ArrayBuffer);
  if (a.length !== keyBytes.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== keyBytes[i]) return false;
  return true;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
