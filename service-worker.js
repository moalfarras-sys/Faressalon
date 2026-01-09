/* Simple offline cache for the single-page site */
const CACHE_NAME = 'fares-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/images/favicon.jpg',
  './assets/images/hero-bg.jpg',
  './assets/images/gallery-01.jpg',
  './assets/images/gallery-02.jpg',
  './assets/images/gallery-03.jpg',
  './assets/images/gallery-04.jpg',
  './assets/images/gallery-05.jpg',
  './assets/images/gallery-06.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          // Cache successful GET responses
          if (req.method === 'GET' && res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

