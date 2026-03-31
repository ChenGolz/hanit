const CACHE = 'petconnect-v3-pages';
const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '');
const withBasePath = (path) => `${BASE_PATH}${path}`.replace(/\/+/g, '/');
const ASSETS = [
  withBasePath('/'),
  withBasePath('/manifest.webmanifest'),
  withBasePath('/icon-192.png'),
  withBasePath('/icon-512.png'),
  withBasePath('/volunteer/'),
  withBasePath('/shelter/'),
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match(withBasePath('/'))))
  );
});
