/**
 * Retires the pre-/app/ service worker that used to control the whole site.
 * The current PWA worker lives at /app/sw.js and is not affected by this registration.
 */
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await self.registration.unregister();

      await Promise.all(
        windows.map((client) => {
          const url = new URL(client.url);
          if (url.origin !== self.location.origin || url.pathname.startsWith('/app/')) {
            return Promise.resolve();
          }
          return client.navigate(client.url).catch(() => undefined);
        }),
      );
    })(),
  );
});
