const CACHE_NAME = 'tccflow-v6';
const OFFLINE_URL = '/pages/login.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/pages/login.html',
  '/pages/cadastro.html',
  '/pages/dashboard.html',
  '/pages/projeto.html',
  '/pages/organizacao.html',
  '/pages/calendario.html',
  '/pages/ia.html',
  '/pages/equipe.html',
  '/pages/google.html',
  '/pages/planos.html',
  '/pages/pesquisa.html',
  '/pages/admin.html',
  '/favicon.png',
  '/css/dark.css',
  '/js/darkmode.js',
  '/js/supabase-init.js',
  '/js/db-service.js'
];

// ==================== Install ====================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ==================== Activate ====================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ==================== Fetch (Network First) ====================
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

// ==================== Background Sync ====================
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncPendingTasks());
  }
});

async function syncPendingTasks() {
  try {
    const cache = await caches.open('tccflow-pending');
    const requests = await cache.keys();
    for (const request of requests) {
      const response = await cache.match(request);
      const data = await response.json();
      await fetch(data.url, {
        method: data.method,
        headers: data.headers,
        body: JSON.stringify(data.body)
      });
      await cache.delete(request);
    }
  } catch (e) {
    console.log('Background sync failed, will retry:', e);
  }
}

// ==================== Periodic Background Sync ====================
self.addEventListener('periodicsync', event => {
  if (event.tag === 'tccflow-update') {
    event.waitUntil(updateCache());
  }
});

async function updateCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_ASSETS);
  } catch (e) {
    console.log('Periodic sync cache update failed:', e);
  }
}

// ==================== Push Notifications ====================
self.addEventListener('push', event => {
  let data = { title: 'TCCFlow', body: 'Você tem uma nova notificação!' };
  if (event.data) {
    try { data = event.data.json(); } catch (e) { data.body = event.data.text(); }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'TCCFlow', {
      body: data.body || '',
      icon: '/favicon.png',
      badge: '/favicon.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'tccflow-notification',
      data: { url: data.url || '/pages/dashboard.html' }
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/pages/dashboard.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes('tccflow') && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
