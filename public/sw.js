const CACHE = 'lugabiz-v1';

self.addEventListener('install', (event) => {
  // No llamar skipWaiting() automáticamente: eso causa que Chrome muestre
  // "Este sitio se actualizó en segundo plano" en cada recarga. El update
  // manual se dispara desde la página vía postMessage({ type: 'SKIP_WAITING' }).
});

self.addEventListener('activate', (event) => {
  // clients.claim() no es necesario para recibir push: los eventos push llegan
  // directamente al SW activo sin importar si controla pestañas abiertas.
  // Sin claim() Chrome deja de mostrar el toast de "actualización en segundo plano".
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Lugabiz', body: event.data.text() };
  }

  // Firebase Cloud Messaging entrega { notification: { title, body }, data: {...} }
  // con `data` siempre string→string. El web-push nativo (en desuso, puede quedar
  // algún dispositivo viejo en transición) mandaba title/body/data sueltos en la raíz.
  const notif = payload.notification || payload;
  const extra = payload.data || {};

  const title = notif.title || 'Lugabiz';
  const tag = extra.tag
    || (extra.surveyId ? `survey-${extra.surveyId}` : undefined)
    || (extra.place_id ? `nearby-${extra.place_id}` : undefined);

  const options = {
    body: notif.body || '',
    icon: '/L.ico',
    badge: '/L.ico',
    vibrate: [200, 100, 200],
    tag,
    renotify: true,
    data: {
      url: extra.url || '/',
      surveyId: extra.surveyId || null,
    },
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
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

// Escuchar mensajes de la página para forzar actualización del SW
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
