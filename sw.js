// Service Worker Minimalista - Refycon
// Versión simplificada para evitar problemas de SRI

const CACHE_NAME = 'refycon-v1.1.0';

// Instalación - solo cachear archivos locales
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache inicializado');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error durante instalación', error);
      })
  );
});

// Activación
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Estrategia simple: Network First con fallback a cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Ignorar solicitudes no-GET
  if (request.method !== 'GET') {
    return;
  }

  // Para recursos externos, intentar red primero
  if (!request.url.includes(self.location.origin)) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Si falla la red, intentar desde cache, sino retornar error genérico
          return caches.match(request)
            .then((response) => response || new Response('Offline', { status: 503 }));
        })
    );
    return;
  }

  // Para recursos locales, intentar cache primero
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
            return response;
          })
          .catch(() => {
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

console.log('Service Worker: Cargado correctamente');
