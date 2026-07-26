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

// ── Firebase Cloud Messaging ─────────────────────────────────────────────────
// Los mensajes FCM que incluyen `notification` (como los que mandan las Edge
// Functions) llegan al evento 'push' nativo en un formato propio de Firebase
// que un `event.data.json()` genérico NO puede decodificar — probamos eso y
// Chrome mostraba el aviso genérico "Este sitio se actualizó en segundo
// plano" en vez de la notificación real, porque nuestro handler no llamaba a
// showNotification(). El SDK de Firebase Messaging (cargado acá vía
// importScripts, build "compat" porque un Service Worker clásico no soporta
// ESM) sabe decodificar ese formato — así que dejamos que él escuche 'push' y
// solo le decimos qué hacer con cada mensaje.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Config pública de Firebase (no es secreta, está restringida por dominio/appId
// en la consola). No se puede leer de env vars acá: este archivo se sirve tal
// cual desde /public, Vite no lo procesa.
firebase.initializeApp({
  apiKey: 'AIzaSyC7_FDAQqFovzbDbKyJ7KMZsH7aRSshywA',
  authDomain: 'lugabiz-mobile.firebaseapp.com',
  projectId: 'lugabiz-mobile',
  storageBucket: 'lugabiz-mobile.firebasestorage.app',
  messagingSenderId: '259194666195',
  appId: '1:259194666195:web:f668bb8d45c5443634e826',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notif = payload.notification || {};
  const data = payload.data || {};

  const title = notif.title || 'Lugabiz';
  const tag = data.tag
    || (data.surveyId ? `survey-${data.surveyId}` : undefined)
    || (data.place_id ? `nearby-${data.place_id}` : undefined);

  self.registration.showNotification(title, {
    body: notif.body || '',
    icon: '/L.ico',
    badge: '/L.ico',
    vibrate: [200, 100, 200],
    tag,
    renotify: true,
    data: {
      url: data.url || '/',
      surveyId: data.surveyId || null,
    },
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  });
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
