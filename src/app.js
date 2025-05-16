import { router } from './routes.js';
import {
  subscribeUserToPush as subscribePush,
  unsubscribeUserFromPush as unsubscribePush,
  isUserSubscribed as isSubscribed,
} from './script/push-helper.js';

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', async () => {
  await router();
  await renderNavbar();
});

// Toast helper
function showToast(message, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

export async function renderNavbar() {
  const navbar = document.getElementById('navbar');
  const token = localStorage.getItem('accessToken');

  let pushToggleButton = '';
  let subscribed = false;

  if ('serviceWorker' in navigator && 'PushManager' in window && token) {
    subscribed = await isSubscribed();
    pushToggleButton = `
      <a href="#" id="toggle-push">${subscribed ? '🔕 Unsubscribe' : '🔔 Subscribe'}</a>
    `;
  }

  navbar.innerHTML = token
    ? `
      ${pushToggleButton}
      <a href="#/">Beranda</a>
      <a href="#/bookmark">📚 Bookmark</a>
      <a href="#/tambah">Tambah Cerita</a>
      <a href="#" id="logout-link">Logout</a>
    `
    : `
      <a href="#/">Beranda</a>
      <a href="#/login">Login</a>
      <a href="#/register">Daftar</a>
    `;

  // Logout
  const logout = document.getElementById('logout-link');
  if (logout) {
    logout.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('accessToken');
      alert('Anda telah logout.');
      location.hash = '#/';
      router();
      renderNavbar();
    });
  }

  // Toggle Push Subscribe
  const togglePush = document.getElementById('toggle-push');
  if (togglePush) {
    togglePush.addEventListener('click', async (e) => {
      e.preventDefault();
      const registration = await navigator.serviceWorker.getRegistration();
      const token = localStorage.getItem('accessToken');
      if (!token) return alert('Anda harus login terlebih dahulu.');

      let success = false;

      if (subscribed) {
        success = await unsubscribePush(registration, token);
        if (success) {
          subscribed = false;
          showToast('🔕 Notifikasi dimatikan.');
        }
      } else {
        success = await subscribePush(registration, token);
        if (success) {
          subscribed = true;
          showToast('🔔 Notifikasi diaktifkan!');
        }
      }

      togglePush.textContent = subscribed ? '🔕 Unsubscribe' : '🔔 Subscribe';
    });
  }
}

const mainContent = document.querySelector("#main");
const skipLink = document.querySelector(".skip-link");

skipLink.addEventListener("click", function (event) {
  event.preventDefault();
  skipLink.blur();
  mainContent.setAttribute('tabindex', '-1');
  mainContent.focus();
  mainContent.scrollIntoView();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const reg = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', reg);

    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  });
}
