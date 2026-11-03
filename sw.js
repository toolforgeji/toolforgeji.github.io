// ToolForge Service Worker - offline cache (v3)
const CACHE_NAME = 'toolforge-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/contact.html',
  '/404.html',
  '/tools.json',
  '/assets/css/design-system.css',
  '/assets/js/common.js',
  '/assets/js/home.js',
  '/assets/img/logo.svg',
  '/assets/img/og-image.png'
];

// Cache each asset separately so one missing file cannot abort the whole install.
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(STATIC_ASSETS.map((url) =>
      cache.add(url).catch((err) => console.warn('[SW] could not cache', url, err))
    ));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Stale-while-revalidate for same-origin GET requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request);
    const network = fetch(event.request).then((res) => {
      if (res && res.status === 200) cache.put(event.request, res.clone());
      return res;
    }).catch(() => cached);
    return cached || network;
  })());
});
