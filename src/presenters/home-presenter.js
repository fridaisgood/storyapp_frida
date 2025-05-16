import {
    getStories
} from '../services/story-service.js';
import {
    HomeView
} from '../views/home-view.js';

export class HomePresenter {
    constructor(container) {
        this.view = new HomeView(container);
        this.currentPage = 1;
        this.pageSize = 8;
        this.stories = [];
    }

    async init() {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            this.view.showNotLoggedIn();
            return;
        }

        this.view.showLoading();

        try {
            this.stories = await getStories();
            this.renderPage();
            this.initMap(this.stories);
        } catch (err) {
            this.view.showError(err.message);
        }
    }

    renderPage() {
        const totalPages = Math.ceil(this.stories.length / this.pageSize);
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageStories = this.stories.slice(start, end);

        this.view.showStories(
            pageStories,
            this.currentPage,
            totalPages,
            () => this.goPrev(),
            () => this.goNext(totalPages)
        );


        // 👉 tambahkan ini supaya map selalu di-reload tiap halaman
        this.initMap(this.stories);
    }

    goPrev() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderPage();
        }
    }

    goNext(totalPages) {
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderPage();
        }
    }

    initMap(stories) {
        // Cegah tambah script berulang
        if (!window.L) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
            script.onload = () => this.createMap(stories);
            document.body.appendChild(script);
        } else {
            this.createMap(stories);
        }
    }

    createMap(stories) {
        // Hapus map sebelumnya jika sudah ada
        if (this.map) {
            this.map.remove();
            this.map = null;
        }

        // Reset binding Leaflet di DOM map container
        const mapContainer = document.getElementById('map');
        if (mapContainer && mapContainer._leaflet_id) {
            mapContainer._leaflet_id = null;
        }

        const openStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        });

        this.map = L.map('map', {
            center: [-6.2, 106.8],
            zoom: 5,
            layers: [openStreet]
        });

        stories.forEach((story) => {
            if (story.lat && story.lon) {
                L.marker([story.lat, story.lon])
                    .addTo(this.map)
                    .bindPopup(`<strong>${story.name}</strong><br>${story.description}`);
            }
        });
    }
}