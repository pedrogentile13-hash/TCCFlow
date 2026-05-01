// TCCFlow Service Worker
// Suporta notificações push e cache estratégico

const CACHE_NAME = 'tccflow-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/dark.css',
    '/js/darkmode.js',
    '/js/preferences.js',
    '/js/profile-photo.js',
    '/js/notifications.js',
    '/favicon.png'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache).catch(() => {
                console.log('Alguns arquivos não puderam ser cacheados');
            });
        })
    );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar requisições
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }

            return fetch(event.request).then(response => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                return caches.match(event.request);
            });
        })
    );
});

// Manipulador de notificações
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'TCCFlow';
    const options = {
        body: data.body || 'Você tem uma nova notificação',
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: data.tag || 'notification',
        ...data.options
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Manipulador de cliques em notificações
self.addEventListener('notificationclick', event => {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Procurar por uma janela já existente
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se nenhuma janela existir, abrir uma nova
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Sincronização em background (para notificações offline)
self.addEventListener('sync', event => {
    if (event.tag === 'sync-notifications') {
        event.waitUntil(
            syncNotifications()
        );
    }
});

async function syncNotifications() {
    // Implementar sincronização de notificações quando a conexão retornar
    console.log('Sincronizando notificações...');
}
