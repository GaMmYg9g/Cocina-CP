// =============================================================
// Service Worker · Central Perk
// Estrategia: Network First + Limpieza Automática de Caché
// =============================================================

const CACHE_NAME = 'central-perk-cache'; // Nombre fijo, sin versiones manuales

self.addEventListener('install', (event) => {
  // Fuerza al nuevo Service Worker a activarse inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Limpia TODOS los cachés antiguos automáticamente
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName); // Borra el caché viejo
        })
      );
    }).then(() => self.clients.claim()) // Toma el control de las pestañas abiertas
  );
});

self.addEventListener('fetch', (event) => {
  // Solo manejamos peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    // 1. Intentar ir a la red primero (Network First)
    fetch(event.request)
      .then((networkResponse) => {
        // Si la respuesta es válida, la guardamos en el caché actualizado
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 2. Si falla la red (sin internet), buscar en el caché (Offline fallback)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no está en caché y no hay red, y es una navegación, devolver el index
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});
