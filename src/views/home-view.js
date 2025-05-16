export class HomeView {
    constructor(container) {
      this.container = container;
    }
  
    showLoading() {
      this.container.innerHTML = '<p>Loading stories...</p>';
    }
  
    showError(message) {
      this.container.innerHTML = `<p>Gagal memuat cerita: ${message}</p>`;
    }
  
    showNotLoggedIn() {
      this.container.innerHTML = `
        <div class="login-banner-wrapper">
          <img src="assets/home.png" alt="Login Banner" />
          <p>Anda belum login.</p>
          <a href="#/login" class="btn-login-link">Klik di sini untuk login</a>
        </div>`;
    }
  
    showStories(stories, currentPage, totalPages, onPrev, onNext) {
      const list = stories.map((story) => `
        <div class="story-card">
          <img src="${story.photoUrl}" alt="${story.name}" />
          <div class="story-content">
            <h3>${story.name}</h3>
            <p>${story.description}</p>
            <p class="story-date">📅 ${new Date().toLocaleDateString()}</p>
           <a class="story-button" href="#/detail/${story.id}">Selengkapnya ➔</a>
          </div>
        </div>
      `).join('');
  
      this.container.innerHTML = `
        <h2>Lihat Cerita</h2>
        <div id="story-list">${list}</div>
        
        <div class="pagination">
          <button id="prev-btn" ${currentPage === 1 ? 'disabled' : ''}>← Sebelumnya</button>
          <span>Halaman ${currentPage} dari ${totalPages}</span>
          <button id="next-btn" ${currentPage === totalPages ? 'disabled' : ''}>Selanjutnya →</button>
        </div>
  
        <div id="map" style="height: 300px; margin-top:1rem; border:1px solid #ccc;"></div>
        <button id="fab">＋</button>
      `;
  
      document.getElementById('prev-btn').addEventListener('click', onPrev);
      document.getElementById('next-btn').addEventListener('click', onNext);
  
      document.getElementById('fab').addEventListener('click', () => {
        location.hash = '#/tambah';
      });
    }
  }
  