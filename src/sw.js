importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Precaching
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

// Static assets: JS, CSS, Images
workbox.routing.registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'static-resources',
  })
);

// Google Fonts
workbox.routing.registerRoute(
  ({ url }) =>
    url.origin.startsWith('https://fonts.googleapis.com') ||
    url.origin.startsWith('https://fonts.gstatic.com'),
  new workbox.strategies.CacheFirst({
    cacheName: 'google-fonts',
  })
);

// Push Notification
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Story Baru!',
    options: {
      body: 'Deskripsi story tidak tersedia.',
    }
  };

  try {
    const data = event.data.json();
    payload = data;
  } catch (e) {
    console.warn('⚠️ Tidak bisa parse payload push. Gunakan default.');
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, payload.options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

workbox.routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'html-cache',
  })
);
