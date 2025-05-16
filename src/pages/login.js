import { loginUser } from '../services/story-service.js';
import { router } from '../routes.js';
import { renderNavbar } from '../app.js';

export function showLogin(container) {
  container.innerHTML = `
    <div class="form-wrapper">
      <h2>Login</h2>
      <form id="loginForm">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required />

        <label for="password">Password</label>
        <input type="password" id="password" name="password" required />

        <button type="submit">Login</button>
      </form>
    </div>
  `;

  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const token = await loginUser(formData.get('email'), formData.get('password'));
      localStorage.setItem('accessToken', token);
      alert('Login berhasil!');

      location.hash = '#/';
      router(); 
      renderNavbar(); 
    } catch (err) {
      alert('Gagal login: ' + err.message);
    }
  });
}
