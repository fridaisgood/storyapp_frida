import { getStoryByIdSafe } from '../services/story-service.js';
import {
  saveStory,
  deleteStory,
  isStorySaved
} from '../data/db.js';

export async function showDetail(container, id) {
  container.innerHTML = '<p>Loading detail...</p>';

  try {
    const story = await getStoryByIdSafe(id);
    const saved = await isStorySaved(story.id); // Ambil status SEBELUM render HTML

    container.innerHTML = `
      <div class="detail-container">
        <a href="#/" class="back-link">← Kembali ke Daftar Cerita</a>
        <h2>${story.name}</h2>
        <p>${new Date(story.createdAt).toLocaleDateString()}</p>
        <img src="${story.photoUrl}" alt="${story.name}" />
        <p>${story.description}</p>

        <h3>Lokasi</h3>
        <p>📍 Latitude: ${story.lat}, Longitude: ${story.lon}</p>
        <div id="map" style="height:300px; margin-top:1rem;"></div>

        <div class="bookmark-actions" style="margin-top: 1rem;">
          <button id="bookmark-button" class="custom-btn">
            ${saved ? '🗑️ Hapus Simpanan' : '📌 Simpan Cerita'}
          </button>
          <button id="notify-button" class="custom-btn">🔔 Try Notify Me</button>
        </div>
      </div>
    `;

    // Tombol Simpan/Hapus
    const bookmarkButton = document.getElementById('bookmark-button');
    bookmarkButton.addEventListener('click', async () => {
      const isSaved = await isStorySaved(story.id);

      if (!isSaved) {
        await saveStory({ ...story, isCached: false });
        alert('✅ Cerita disimpan.');
      } else {
        await deleteStory(story.id);
        alert('✅ Cerita dihapus dari simpanan.');
      }

      const savedNow = await isStorySaved(story.id);
      bookmarkButton.textContent = savedNow
        ? '🗑️ Hapus Simpanan'
        : '📌 Simpan Cerita';
    });

    // Tombol Try Notify Me
    const notifyButton = document.getElementById('notify-button');
    if (notifyButton) {
      notifyButton.addEventListener('click', async () => {
        const isSaved = await isStorySaved(story.id);

        if (!isSaved) {
          alert('❗ Cerita belum disimpan. Simpan dulu untuk menerima notifikasi.');
          return;
        }

        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.showNotification('✅ Cerita Tersimpan', {
            body: `"${story.name}" sudah disimpan ke bookmark Anda.`,
            icon: '/icons/icon-192x192.png',
            tag: 'story-saved'
          });
        }
      });
    }

    // Leaflet map
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
    script.onload = () => {
      const map = L.map('map').setView([story.lat, story.lon], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);
      L.marker([story.lat, story.lon]).addTo(map).bindPopup(story.name);
    };
    document.body.appendChild(script);

  } catch (err) {
    container.innerHTML = `<p>❌ Gagal memuat detail: ${err.message}</p>`;
  }
}
