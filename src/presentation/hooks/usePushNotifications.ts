import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@lib/supabase/client';
import { useAuth } from '@presentation/context';

const PUBLIC_VAPID_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined)?.trim() ||
  'BBfkqJL_-RpARKDGkzCuVCnEvPgcVgBlIPq9UCINWQmDHVrukbnOUR00wZaZJQETLD0t-Rkcp8X0b-wRDc_BGnk';

// Guarda en localStorage el endpoint ya confirmado en la DB para no hacer el
// upsert en cada recarga. Se invalida si el endpoint cambia (nuevas VAPID, reset de permisos).
const LS_KEY = '_lgz_push_ep';

// ── Helpers ──────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(b64: string): Uint8Array {
  const padding = '='.repeat((4 - (b64.length % 4)) % 4);
  const base64 = (b64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function appServerKeyMatches(sub: PushSubscription, keyBytes: Uint8Array): boolean {
  const existing = sub.options?.applicationServerKey;
  if (!existing) return false;
  const a = new Uint8Array(existing as ArrayBuffer);
  if (a.length !== keyBytes.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== keyBytes[i]) return false;
  return true;
}

// ── Lógica principal (reutilizable desde el hook y desde el botón manual) ───

async function registerAndSave(userId: string): Promise<'saved' | 'denied' | 'error'> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] El navegador no soporta push notifications');
    return 'error';
  }

  // Pedir permiso si no está concedido todavía
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
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const keyBytes = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
    let sub = await reg.pushManager.getSubscription();

    // Si la suscripción existe pero usa otra clave VAPID, re-suscribir
    if (sub && !appServerKeyMatches(sub, keyBytes)) {
      console.log('[push] Clave VAPID cambió → re-suscribiendo');
      try { await sub.unsubscribe(); } catch { /* */ }
      sub = null;
    }

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyBytes,
      });
      console.log('[push] Nueva suscripción creada');
    }

    // Verificar si este endpoint ya está confirmado en la DB
    const savedEndpoint = localStorage.getItem(LS_KEY);
    if (savedEndpoint === sub.endpoint) {
      // Verificar que sigue en la DB (puede haberse borrado)
      const { count } = await supabase
        .from('push_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('endpoint', sub.endpoint);
      if ((count ?? 0) > 0) {
        console.log('[push] Suscripción ya guardada en DB');
        return 'saved';
      }
      // No estaba en DB — borramos la caché y guardamos de nuevo
      localStorage.removeItem(LS_KEY);
    }

    // Guardar / actualizar en la DB
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { user_id: userId, endpoint: sub.endpoint, subscription: JSON.parse(JSON.stringify(sub)) },
        { onConflict: 'endpoint' },
      );

    if (error) {
      // El error más frecuente aquí es RLS sin política de INSERT o falta de
      // constraint única en `endpoint`. Correr el SQL de fix resuelve esto.
      console.error('[push] ❌ No se pudo guardar en push_subscriptions:', error.message, '| code:', error.code, '| hint:', error.hint);
      return 'error';
    }

    console.log('[push] ✓ Suscripción guardada en la DB');
    localStorage.setItem(LS_KEY, sub.endpoint);
    return 'saved';
  } catch (err) {
    console.error('[push] Error registrando la suscripción:', err);
    return 'error';
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

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

  // Chrome renueva suscripciones automáticamente. El SW manda este mensaje
  // para que el hook re-registre el nuevo endpoint en la DB.
  useEffect(() => {
    if (!user || !('serviceWorker' in navigator)) return;
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
        ran.current = false;
        registerAndSave(user.id);
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onMessage);
  }, [user]);

  // Función para el botón "Activar notificaciones" (requiere gesto del usuario).
  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    ran.current = false; // Resetear para permitir re-intentos manuales
    const result = await registerAndSave(user.id);
    ran.current = true;
    return result === 'saved';
  }, [user]);

  return { enablePushNotifications };
}
