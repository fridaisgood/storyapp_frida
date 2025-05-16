import { registerUser } from '../services/story-service.js';

export function showRegister(container) {
  container.innerHTML = `
  <div class="form-wrapper">
    <h2>Daftar</h2>
    <form id="registerForm">
      <label for="name">Nama</label>
      <input type="text" id="name" name="name" required />

      <label for="email">Email</label>
      <input type="email" id="email" name="email" required />

      <label for="password">Password</label>
      <input type="password" id="password" name="password" required />

      <button type="submit">Daftar</button>
    </form>
    </div>
  `;

  const form = document.getElementById('registerForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      await registerUser(formData.get('name'), formData.get('email'), formData.get('password'));
      alert('Registrasi berhasil, silakan login.');
      location.hash = '#/login';
    } catch (err) {
      alert('Gagal daftar: ' + err.message);
    }
  });
}
