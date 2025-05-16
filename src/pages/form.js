import { addStory } from '../services/story-service.js';

export function showForm(container) {
  container.innerHTML = `
  <div class="form-wrapper">
    <h2>Tambah Cerita</h2>
    <form id="storyForm">
      <label for="description">Deskripsi</label>
      <textarea id="description" name="description" required></textarea>

      <label>📷 Foto (kamera)</label>
      <video id="cameraPreview" width="300" autoplay playsinline style="border:1px solid #ccc; display:none;"></video>
      <div>
        <button type="button" id="startCamera">Buka Kamera</button>
        <button type="button" id="capturePhoto" style="display:none;">Ambil Foto</button>
        <button type="button" id="stopCamera" style="display:none;">Tutup Kamera</button>
      </div>

      <p>atau</p>
      <input type="file" id="photo" name="photo" accept="image/*" />

      <div style="margin-top:1rem;">
        <img id="photoPreview" src="" alt="Preview Foto" style="max-width:300px; display:none; border:1px solid #ccc;" />
        <button type="button" id="deletePhoto" class="outline" style="display:none;">Hapus Foto</button>
      </div>

      <label for="map">Pilih Lokasi</label>
      <div id="map" style="height:300px; border:1px solid #ccc;"></div>

      <div class="coord-inputs">
        <input type="text" id="lat" name="lat" placeholder="Latitude" readonly />
        <input type="text" id="lon" name="lon" placeholder="Longitude" readonly />
      </div>

      <div class="form-buttons">
        <button type="submit" class="primary">Buat Laporan</button>
        <button type="button" class="outline" onclick="location.hash='#/'">Batal</button>
      </div>
    </form>
  </div>
`;

  initMapSelect();

  const startCameraBtn = document.getElementById('startCamera');
  const capturePhotoBtn = document.getElementById('capturePhoto');
  const stopCameraBtn = document.getElementById('stopCamera');
  const deletePhotoBtn = document.getElementById('deletePhoto');
  const video = document.getElementById('cameraPreview');
  const canvas = document.createElement('canvas');
  const photoInput = document.getElementById('photo');
  const photoPreview = document.getElementById('photoPreview');
  
  let stream;
  
  // ✅ Buka kamera
  startCameraBtn.addEventListener('click', async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      video.style.display = 'block';
      capturePhotoBtn.style.display = 'inline-block';
      stopCameraBtn.style.display = 'inline-block';
      startCameraBtn.style.display = 'none'; // 🔥 sembunyikan tombol buka
    } catch (err) {
      alert('Kamera tidak bisa diakses: ' + err.message);
    }
  });  
  
  // ✅ Ambil foto
  capturePhotoBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    canvas.toBlob(blob => {
      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      photoInput.files = dataTransfer.files;
  
      const imageUrl = URL.createObjectURL(blob);
      photoPreview.src = imageUrl;
      photoPreview.style.display = 'block';
      deletePhotoBtn.style.display = 'inline-block';
  
      alert('Foto berhasil diambil!');
    }, 'image/jpeg');
  });
  
  // ✅ Tutup kamera
  stopCameraBtn.addEventListener('click', () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      video.style.display = 'none';
      capturePhotoBtn.style.display = 'none';
      stopCameraBtn.style.display = 'none';
      startCameraBtn.style.display = 'inline-block'; // 🔥 tampilkan lagi tombol buka
    }
});
  
  // ✅ Preview jika pilih file manual
  photoInput.addEventListener('change', () => {
    const file = photoInput.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      photoPreview.src = imageUrl;
      photoPreview.style.display = 'block';
      deletePhotoBtn.style.display = 'inline-block';
    }
  });
  
  // ✅ Hapus foto
  deletePhotoBtn.addEventListener('click', () => {
    photoInput.value = '';
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    deletePhotoBtn.style.display = 'none';
  });
  

  document.getElementById('storyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return alert('Anda belum login!');

    const form = e.target;
    const photo = form.photo.files[0];
    const description = form.description.value;
    const lat = form.lat.value;
    const lon = form.lon.value;

    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('description', description);
    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    try {
      await addStory(formData, token);
      alert('Cerita berhasil dikirim!');
      location.hash = '#/';
      setTimeout(() => location.reload(), 100);
    } catch (err) {
      alert('Gagal mengirim cerita: ' + err.message);
    }
  });
}

function initMapSelect() {
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
  script.onload = () => {
    const openStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    });

    const mapTiler = L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_MAPTILER_API_KEY', {
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
    });

    const map = L.map('map', {
      center: [-6.2, 106.8],
      zoom: 10,
      layers: [openStreet]
    });

    const baseMaps = {
      "OpenStreetMap": openStreet,
      "MapTiler Streets": mapTiler
    };

    L.control.layers(baseMaps).addTo(map);

    let marker;
    map.on('click', function (e) {
      const { lat, lng } = e.latlng;
      document.getElementById('lat').value = lat;
      document.getElementById('lon').value = lng;

      if (marker) marker.setLatLng(e.latlng);
      else marker = L.marker(e.latlng).addTo(map).bindPopup('Lokasi dipilih').openPopup();
    });
  };
  document.head.appendChild(script);
}
