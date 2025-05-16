import { showHome } from './pages/home.js'; 
import { showForm } from './pages/form.js';
import { showLogin } from './pages/login.js';
import { showRegister } from './pages/register.js';
import { showDetail } from './pages/detail.js';
import { showBookmark } from './pages/bookmark.js';

const routes = {
  '/': showHome,
  '/tambah': showForm,
  '/login': showLogin,
  '/register': showRegister,
  '/bookmark': showBookmark,
};

export function router() {
  const content = document.getElementById('app-content');
  const hash = window.location.hash.slice(1) || '/';

 
  const match = hash.match(/^\/detail\/(.+)$/);
  if (match) {
    showDetail(content, match[1]);
    return;
  }

  
  const render = routes[hash] || (() => content.innerHTML = '<p>Halaman tidak ditemukan.</p>');

  if (document.startViewTransition) {
    document.startViewTransition(() => render(content));
  } else {
    render(content);
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
