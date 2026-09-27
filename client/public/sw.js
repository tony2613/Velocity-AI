// VelocityAI Service Worker - Self-Destroying Kill Switch
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))),
      self.clients.claim()
    ]).then(() => {
      return self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          client.navigate(client.url);
        }
      });
    })
  );
});

self.addEventListener('fetch', () => {
  // Pass all fetches directly to network without interception
});
