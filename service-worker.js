self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('crm-bambu-cache').then(cache => cache.add('manifest.json'))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
