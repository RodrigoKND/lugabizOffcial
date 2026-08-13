const CACHE = 'lugabiz-v2';

// URL del servidor propio de notificaciones (Downloads/lugabizPushServer,
// Express en Vercel — reemplaza a Firebase/Edge Functions). No es secreto,
// pero Vite NO procesa este archivo (se sirve tal cual desde /public, sin
// pasar por build), así que no puede leer env vars: se resuelve por
// hostname para no compartir servidor entre dev y producción.
// TODO: reemplazar por el dominio real una vez desplegado lugabizPushServer en Vercel.
const PUSH_SERVER_URL = (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : 'https://lugabiz-push-server.vercel.app';

self.addEventListener('install', () => {
  // No llamar skipWaiting() automáticamente: eso causa que Chrome muestre
  // "Este sitio se actualizó en segundo plano" en cada recarga. El update
  // manual se dispara desde la página vía postMessage({ type: 'SKIP_WAITING' }).
});

self.addEventListener('activate', () => {
  // clients.claim() no es necesario para recibir push: los eventos push llegan
  // directamente al SW activo sin importar si controla pestañas abiertas.
  // Sin claim() Chrome deja de mostrar el toast de "actualización en segundo plano".
});

// ── Web Push nativo (VAPID) ──────────────────────────────────────────────────
// El backend propio manda el payload como JSON plano (ver
// lugabizPushServer/src/services/webpush.ts), así que basta con
// event.data.json() — a diferencia de FCM, que necesitaba el SDK de Firebase
// para decodificar su propio formato.
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'Lugabiz', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'Lugabiz';

  event.waitUntil(self.registration.showNotification(title, {
    body: payload.body || '',
    icon: '/L.ico',
    badge: '/L.ico',
    vibrate: [200, 100, 200],
    tag: payload.tag,
    renotify: !!payload.tag,
    data: { url: payload.url || '/', ...(payload.data || {}) },
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || '/';

  const urlToOpen = targetUrl.startsWith('/')
    ? self.location.origin + targetUrl
    : targetUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      // Si ya hay una ventana abierta de la app, enfoca y navega
      for (const client of clientsList) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => {
            if ('navigate' in client) return client.navigate(urlToOpen);
          });
        }
      }
      // Si no hay ventana abierta, abre una nueva
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

// El navegador puede rotar la suscripción en segundo plano (sobre todo
// Android) sin ninguna pestaña abierta. Nos re-suscribimos solos y avisamos
// al servidor propio SIN auth de usuario (no hay sesión disponible acá) — la
// posesión del endpoint viejo (único, no adivinable) es la prueba de
// identidad, mismo patrón que usa nexus para este caso.
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil((async () => {
    const oldEndpoint = event.oldSubscription ? event.oldSubscription.endpoint : null;
    if (!oldEndpoint) return;

    const applicationServerKey = event.oldSubscription
      ? event.oldSubscription.options.applicationServerKey
      : undefined;

    const newSub = event.newSubscription
      || await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });

    try {
      await fetch(`${PUSH_SERVER_URL}/api/v1/push/resubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldEndpoint, subscription: newSub.toJSON() }),
      });
    } catch (err) {
      console.error('[sw] resubscribe falló', err);
    }
  })());
});

// Escuchar mensajes de la página para forzar actualización del SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
