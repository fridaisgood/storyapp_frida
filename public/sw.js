self.addEventListener('push', (event) => {
  console.log('📦 Push received');

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
