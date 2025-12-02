// Service Worker Ultra Minimalista - Refycon
// Versión que NO cachea nada para evitar conflictos en Vercel

self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Dejar que el navegador maneje todo
  // No hacer nada, solo dejar pasar
});

console.log('[SW] Service Worker loaded');
