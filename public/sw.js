const CACHE = 'lugabiz-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/L.ico',
      badge: '/L.ico',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'Ver' },
        { action: 'close', title: 'Cerrar' },
      ],
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'Lugabiz', options)
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('Lugabiz', {
        body: event.data.text(),
        icon: '/L.ico',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then(() => client.navigate(url));
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
