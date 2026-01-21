
const CACHE_NAME = 'swimflow-v1.1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
];

// Installation: Cache assets and force update
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active one immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SwimFlow: Pre-caching core assets');
      return cache.addAll(ASSETS);
    })
  );
});

// Activation: Clean up old caches and take control of all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SwimFlow: Clearing legacy cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim() // Immediately take control of open pages
    ])
  );
});

// Fetch: Network-first falling back to cache (or cache-first for specific assets)
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have it in cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Otherwise try the network
      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Fallback to index.html for navigation requests (SPA support)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
