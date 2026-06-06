import { useEffect, useRef } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@presentation/context';

const PUBLIC_VAPID_KEY = 'BIGu7eYIOEKFEb75vP4Jj4GIFalj2Sx_Y3y-R8bZzg6wHXFJKMlGQKyBQSYEW0aJWqM2K8eHIyDNEFZBh8f-G_U';

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

        let sub = await reg.pushManager.getSubscription();

        if (!sub) {
          if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return;
          }

          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
          });
        }

        if (sub && user) {
          await supabase
            .from('push_subscriptions')
            .upsert({
              user_id: user.id,
              subscription: JSON.parse(JSON.stringify(sub)),
            }, { onConflict: 'user_id' });
        }
      } catch (err) {
        console.error('Push registration error:', err);
      }
    };

    init();
  }, [user]);
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
