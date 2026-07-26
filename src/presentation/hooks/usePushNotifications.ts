import { useEffect, useRef, useCallback } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, isSupported, getToken } from 'firebase/messaging';
import { pushSubscriptionsService } from '@lib/supabase/services/push';
import { useAuth } from '@presentation/context';
import { firebaseConfig, firebaseVapidKey } from '@infrastructure/config/firebase';

// Guarda en localStorage el token ya confirmado en la DB para no hacer el
// upsert en cada recarga (dedup operativo, no es dato de negocio del
// usuario). Se invalida si el token cambia.
const LS_KEY = '_lgz_fcm_token';

// NOTA: se probó cargar firebase/app y firebase/messaging con import()
// dinámico para que no viajaran en el bundle inicial, pero en este proyecto
// Rollup no generaba el chunk (el import dinámico desaparecía del build sin
// error — bug puntual de esta config, no de Firebase). Import estático:
// funciona de forma confiable y el paquete queda aislado en su propio chunk
// cacheable vía manualChunks (ver vite.config.ts), así al menos no se vuelve
// a descargar en cada deploy que no toque estas libs.
async function getFcmToken(): Promise<string | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] El navegador no soporta push notifications');
    return null;
  }
  
  if (!firebaseVapidKey) {
    return null;
  }

  if (!(await isSupported())) {
    console.warn('[push] Firebase Messaging no soportado en este navegador');
    return null;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const messaging = getMessaging(app);

  // Reutiliza el mismo service worker que ya maneja notificaciones/click
  // (sw.js) en vez de registrar uno nuevo — evita dos SW compitiendo por el
  // scope '/'. FCM entrega el push como un evento 'push' normal, que sw.js
  // ya sabe interpretar.
  const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  await navigator.serviceWorker.ready;

  return getToken(messaging, { vapidKey: firebaseVapidKey, serviceWorkerRegistration: registration });
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
    const token = await getFcmToken();
    if (!token) return 'error';

    if (localStorage.getItem(LS_KEY) === token) {
      console.log('[push] Token ya guardado en DB');
      return 'saved';
    }

    await pushSubscriptionsService.saveFcmToken(userId, token);
    localStorage.setItem(LS_KEY, token);
    console.log('[push] ✓ Token FCM guardado en la DB');
    return 'saved';
  } catch (err) {
    console.error('[push] Error registrando el token FCM:', err);
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
