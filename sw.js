const CACHE_NAME = 'petconnect-static-v3';
const LOCAL_ASSETS = [
  '',
  'index.html',
  '404.html',
  'assets/style.css',
  'assets/app.js',
  'config.js',
  'manifest.webmanifest',
  'favicon.svg',
  'icon.svg',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'found-pet/',
  'lost-pet/',
  'matches/',
  'volunteer/',
  'shelter/',
  'tel-aviv/',
  'jerusalem/',
  'haifa/',
  'beer-sheva/',
  'netanya/',
  'ashdod/'
];
const REMOTE_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

function scopeUrl(path) {
  return new URL(path, self.registration.scope).toString();
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.allSettled(LOCAL_ASSETS.map(asset => cache.add(scopeUrl(asset))));
    await Promise.allSettled(REMOTE_ASSETS.map(asset => cache.add(asset)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  const sameOrigin = requestUrl.origin === self.location.origin;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(event.request)) ||
               (await caches.match(scopeUrl(requestUrl.pathname.replace(self.location.origin, '')))) ||
               (await caches.match(scopeUrl('index.html')));
      }
    })());
    return;
  }

  if (sameOrigin || REMOTE_ASSETS.includes(event.request.url)) {
    event.respondWith((async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      try {
        const fresh = await fetch(event.request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, fresh.clone());
        return fresh;
      } catch {
        return caches.match(scopeUrl('index.html'));
      }
    })());
  }
});
