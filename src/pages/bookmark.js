import {
  getSavedStories,
  deleteStory
} from '../data/db.js';

export async function showBookmark(container) {
  const stories = await getSavedStories();

  if (stories.length === 0) {
    container.innerHTML = `
      <h2>📚 Cerita Tersimpan</h2>
      <p>Belum ada cerita yang disimpan.</p>
    `;
    return;
  }

  container.innerHTML = `
    <h2>Cerita Tersimpan</h2>
    <ul id="bookmark-list">
      ${stories.map(story => `
        <li data-id="${story.id}">
          <a href="#/detail/${story.id}"><strong>${story.name}</strong></a>
          <br><small>${new Date(story.createdAt).toLocaleString()}</small>
          <br><button class="delete-bookmark">Hapus</button>
        </li>
      `).join('')}
    </ul>
  `;

  // Tambahkan event listener untuk setiap tombol hapus
  const buttons = container.querySelectorAll('.delete-bookmark');
  buttons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const li = e.target.closest('li');
      const id = li.getAttribute('data-id');
      await deleteStory(id);
      alert('Cerita berhasil dihapus dari bookmark.');
      showBookmark(container); // refresh tampilan
    });
  });
}
