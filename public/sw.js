const CACHE_NAME = 'notification-system-v1.1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/info.svg',
  '/urgent.svg'
];

// Helper to determine if caching is enabled from service worker registration query parameters
function isCacheEnabled() {
  try {
    const urlParams = new URLSearchParams(self.location.search);
    return urlParams.get('cache_enabled') === 'true';
  } catch (e) {
    return false; // Fallback to safe off
  }
}

self.addEventListener('install', (event) => {
  // If caching is disabled by env config, skip static asset pre-caching
  if (!isCacheEnabled()) {
    self.skipWaiting();
    return;
  }

  // Pre-cache primary static assets and force immediate activation
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear any outdated cache storage and claim clients immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Deleting outdated cache storage:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

if (isCacheEnabled()) {
  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Intercept GET requests for same-origin assets only
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
      return;
    }

    // Strictly avoid caching backend REST API endpoints or socket connections
    if (url.pathname.startsWith('/api') || url.pathname.includes('socket.io')) {
      return;
    }

    const isHtmlRequest = event.request.headers.get('accept')?.includes('text/html') ||
                          url.pathname === '/' ||
                          url.pathname.endsWith('.html');

    if (isHtmlRequest) {
      // Network-First strategy for HTML/SPA main documents
      event.respondWith(
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return caches.match(event.request);
          })
      );
    } else {
      // Stale-While-Revalidate strategy for other static assets
      event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            }).catch((err) => {
              console.warn('[Service Worker] Network request failed (offline), serving cache fallback if available:', err);
            });

            return cachedResponse || fetchPromise;
          });
        })
      );
    }
  });
}

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.title || 'New Notification';
    const data = payload.data || {};
    const priority = data.priority || 'MEDIUM';

    // 1. LOW priority: do not show any system notification
    if (priority === 'LOW' || priority === 'NONE') {
      console.log(`[Service Worker] Suppressing low/none priority notification (${priority}).`);
      return;
    }

    // 2. Customise appearance and vibration based on priority
    let finalTitle = title;
    let vibratePattern = undefined; // No vibration for MEDIUM priority on mobile

    if (priority === 'HIGH') {
      vibratePattern = [100, 50, 100]; // Milder double-vibration pattern for HIGH priority
    }

    // 3. Select icon/badge asset based on priority
    let iconUrl = '/favicon.svg';
    if (priority === 'HIGH') {
      iconUrl = '/urgent.svg';
    } else if (priority === 'MEDIUM') {
      iconUrl = '/info.svg';
    }

    const options = {
      body: payload.body || '',
      icon: iconUrl,
      badge: iconUrl,
      data: data,
      vibrate: vibratePattern,
    };

    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // If any tab is active/visible on screen OR has focus
        const isAppActive = clientList.some(
          (client) => client.visibilityState === 'visible' || client.focused
        );

        if (isAppActive) {
          console.log('[Service Worker] App tab is active or focused on screen. Suppressing notification popup.');
          return;
        }

        // Assign a unique tag to the notification options to prevent overlapping and allow targeting it
        const tag = data.id || 'push-notification';
        const finalOptions = {
          ...options,
          tag,
        };

        // Show the OS notification and schedule it to close after 2 seconds
        return self.registration.showNotification(finalTitle, finalOptions).then(() => {
          setTimeout(() => {
            self.registration.getNotifications({ tag }).then((notifications) => {
              notifications.forEach((notification) => notification.close());
            });
          }, 3000);
        });
      })
    );
  } catch (e) {
    console.error('[Service Worker] Error processing push event:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const channelId = event.notification.data?.channelId;
  const targetUrl = channelId ? `/channels/${channelId}` : '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'NAVIGATE', url: targetUrl });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
