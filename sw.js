const CACHE_NAME = 'tccflow-v1';
const OFFLINE_URL = '/pages/login.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/pages/login.html',
  '/pages/cadastro.html',
  '/pages/dashboard.html',
  '/favicon.png',
  '/css/dark.css',
  '/js/darkmode.js',
  '/js/supabase-init.js',
  '/js/db-service.js'
];

// Install - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => cached || caches.match(OFFLINE_URL)))
  );
});
