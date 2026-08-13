import { useEffect, useRef, useCallback } from 'react';
import { pushSubscriptionsService } from '@lib/supabase/services/push';
import { useAuth } from '@presentation/context';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

// Guarda en localStorage el endpoint ya confirmado en la DB para no hacer el
// upsert en cada recarga (dedup operativo, no es dato de negocio del
// usuario). Se invalida si el navegador rota la suscripción.
const LS_KEY = '_lgz_push_endpoint';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] El navegador no soporta push notifications');
    return null;
  }
  if (!VAPID_PUBLIC_KEY) {
    console.warn('[push] Falta VITE_VAPID_PUBLIC_KEY');
    return null;
  }

  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
}

async function registerAndSave(userId: string): Promise<'saved' | 'denied' | 'error'> {
  if (Notification.permission === 'denied') {
    console.warn('[push] Permiso de notificaciones bloqueado por el usuario');
    return 'denied';
  }
  if (Notification.permission !== 'granted') {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      console.warn('[push] Permiso no concedido:', perm);
      return 'denied';
    }
  }

  try {
    const subscription = await subscribeToPush();
    if (!subscription) return 'error';

    if (localStorage.getItem(LS_KEY) === subscription.endpoint) {
      console.log('[push] Suscripción ya guardada en DB');
      return 'saved';
    }

    await pushSubscriptionsService.save(userId, subscription);
    localStorage.setItem(LS_KEY, subscription.endpoint);
    console.log('[push] ✓ Suscripción VAPID guardada en la DB');
    return 'saved';
  } catch (err) {
    console.error('[push] Error registrando la suscripción:', err);
    return 'error';
  }
}

export function usePushNotifications() {
  const { user } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    if (!user || ran.current) return;
    ran.current = true;
    if (Notification.permission === 'granted') {
      registerAndSave(user.id);
    }
  }, [user]);

  // Función para el botón "Activar notificaciones" (requiere gesto del usuario).
  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    ran.current = false;
    const result = await registerAndSave(user.id);
    ran.current = true;
    return result === 'saved';
  }, [user]);

  return { enablePushNotifications };
}
