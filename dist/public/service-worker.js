// Cache version - increment when assets change
const CACHE_VERSION = 'v1';
const CACHE_NAME = `balaji-apartment-${CACHE_VERSION}`;

// Assets to cache immediately on service worker install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        // Force the waiting service worker to become active
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip if the request is for an API endpoint
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If the request is in the cache, return the cached version
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if response is not valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it's a stream that can only be consumed once
            const responseToCache = response.clone();

            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch(() => {
        // If both cache and network fail, serve offline fallback
        if (event.request.url.indexOf('.html') > -1) {
          return caches.match('/');
        }
      })
  );
});

// Background sync for offline payments
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-payments') {
    event.waitUntil(syncPayments());
  }
});

// Push notification event handler
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Function to sync pending payments
async function syncPayments() {
  // This would be implemented to sync any offline payments with the server
  // when the user comes back online
  const pendingPayments = await getPendingPaymentsFromIndexedDB();
  
  if (pendingPayments && pendingPayments.length > 0) {
    for (const payment of pendingPayments) {
      try {
        // Try to send the payment to the server
        const response = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payment)
        });
        
        if (response.ok) {
          // Remove from pending queue if successful
          await removePaymentFromIndexedDB(payment.id);
        }
      } catch (error) {
        console.error('Failed to sync payment:', error);
      }
    }
  }
}

// Placeholder functions for IndexedDB operations
// These would be implemented to store and retrieve pending payments when offline
function getPendingPaymentsFromIndexedDB() {
  // Implementation would depend on how the app stores offline data
  return Promise.resolve([]);
}

function removePaymentFromIndexedDB(id) {
  // Implementation would depend on how the app stores offline data
  return Promise.resolve();
}
