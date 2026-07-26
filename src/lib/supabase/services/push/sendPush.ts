// Eco local de una notificación ya insertada en la tabla `notifications` (ver
// suscripción realtime en useAuthProvider.ts): NO es push real, solo evita que
// el usuario logueado con la pestaña abierta tenga que esperar el round-trip
// del push para ver el aviso. El push que llega con la app cerrada/en
// background es 100% responsabilidad de las Edge Functions (FCM).
export async function sendBrowserPush(title: string, body: string, url?: string, data?: Record<string, unknown>) {
  if (!('serviceWorker' in navigator)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, {
      body,
      icon: '/L.ico',
      badge: '/L.ico',
      data: { url: url || '/', ...data },
    });
  } catch (err) { console.error('[sendPush:showNotification]', err); }
}
