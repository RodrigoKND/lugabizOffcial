import { useEffect, useRef } from 'react';

const PUBLIC_VAPID_KEY = 'BIGu7eYIOEKFEb75vP4Jj4GIFalj2Sx_Y3y-R8bZzg6wHXFJKMlGQKyBQSYEW0aJWqM2K8eHIyDNEFZBh8f-G_U';

export function usePushNotifications() {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    if (Notification.permission === 'denied') return;

    const init = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        registered.current = true;

        const sub = await reg.pushManager.getSubscription();
        if (sub) return;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const newSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
        });

        console.log('Push subscribed:', newSub.toJSON());
      } catch (err) {
        console.error('Push registration error:', err);
      }
    };

    if (Notification.permission === 'default') {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') init();
      });
    } else if (Notification.permission === 'granted') {
      init();
    }
  }, []);
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
