// Service Worker para Refycon
// Optimización de rendimiento y funcionalidades offline

const CACHE_NAME = 'refycon-v1.0.0';
const STATIC_CACHE_NAME = 'refycon-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'refycon-dynamic-v1.0.0';

// Archivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/robots.txt',
  '/sitemap.xml',
  '/site.webmanifest',
  // Imágenes principales
  '/refyconheader.png',
  '/logo.png.png',
  '/crane-on-construction-blue-sky-600nw-2644659717.jpg',
  '/pexels-steffen-coonan-1005786-2098624.jpg',
  '/manitas-sitio-construccion-proceso-perforacion-pared-perforador_169016-12114.jpg',
  '/furgoempleados.jpeg',
  // Imágenes Steel Framing
  '/steelframing1.jpg',
  '/steelframing2.jpg',
  '/steelframing3.jpg',
  // Imágenes de proyectos
  '/proyectovilla.jpeg',
  '/proyectopiscina.jpeg',
  '/reformainterior.jpeg',
  // Recursos externos
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.js'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando archivos estáticos');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Instalación completada');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error en la instalación:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activación completada');
        return self.clients.claim();
      })
  );
});

// Interceptación de requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estrategia para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Archivos estáticos - Cache First
    if (STATIC_FILES.includes(url.pathname) || url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
      event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    }
    // Imágenes - Cache First con fallback
    else if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
      event.respondWith(cacheFirst(request, DYNAMIC_CACHE_NAME));
    }
    // Páginas HTML - Network First con fallback
    else if (request.headers.get('accept').includes('text/html')) {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
    }
    // API calls - Network First
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
    }
    // Otros recursos - Stale While Revalidate
    else {
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE_NAME));
    }
  }
});

// Estrategia Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First error:', error);
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Estrategia Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network First: Red no disponible, usando cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/index.html');
    }
    
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Estrategia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Manejo de mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Service Worker: Ejecutando sincronización en segundo plano');
  // Aquí se pueden sincronizar datos pendientes cuando se recupere la conexión
}

// Notificaciones push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png.png',
      badge: '/logo.png.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'Ver más',
          icon: '/logo.png.png'
        },
        {
          action: 'close',
          title: 'Cerrar',
          icon: '/logo.png.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Solo cerrar la notificación
  } else {
    // Click en el cuerpo de la notificación
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Limpieza periódica del cache
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  const cacheNames = await caches.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('refycon-dynamic-')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response.headers.get('date');
        
        if (dateHeader) {
          const responseDate = new Date(dateHeader).getTime();
          if (now - responseDate > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }
}

console.log('Service Worker: Cargado correctamente');
