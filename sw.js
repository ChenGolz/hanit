const CACHE_NAME = 'petconnect-static-v6';
const APP_SHELL = [
  './',
  './index.html',
  './404.html',
  './assets/style.css',
  './assets/app.js',
  './config.js',
  './manifest.webmanifest',
  './favicon.svg',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './found-pet/',
  './lost-pet/',
  './matches/',
  './volunteer/',
  './shelter/',
  './tel-aviv/',
  './jerusalem/',
  './haifa/',
  './beer-sheva/',
  './netanya/',
  './ashdod/'
];
const REMOTE_ASSETS = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL);
    await Promise.allSettled(REMOTE_ASSETS.map(url => cache.add(url)));
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

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, fresh.clone());
  return fresh;
}

async function networkFirst(request) {
  try {
    const fresh = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fresh.clone());
    return fresh;
  } catch {
    return (await caches.match(request)) || (await caches.match('./index.html'));
  }
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.origin === self.location.origin || REMOTE_ASSETS.includes(event.request.url)) {
    event.respondWith(cacheFirst(event.request).catch(() => caches.match('./index.html')));
  }
});
