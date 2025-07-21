const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_ENDPOINTS = {
    trendingMovies: `/trending/movie/week?api_key=${API_KEY}&language=id-ID`,
    indonesianMovies: `/discover/movie?api_key=${API_KEY}&language=id-ID&sort_by=popularity.desc&with_original_language=id`,
    popularTV: `/tv/popular?api_key=${API_KEY}&language=id-ID`,
    popularMovies: `/movie/popular?api_key=${API_KEY}&language=id-ID`,
    topRatedMovies: `/movie/top_rated?api_key=${API_KEY}&language=id-ID`,
    multiSearch: `/search/multi?api_key=${API_KEY}&language=id-ID&include_adult=false&query=`,
};
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// Elemen DOM
const categoryTitle = document.getElementById('category-title');
const movieGrid = document.getElementById('movie-grid');
const indonesianMoviesGrid = document.getElementById('indonesian-movies-grid');
const tvSeriesGrid = document.getElementById('tv-series-grid');
const popularGrid = document.getElementById('popular-movies');
const topRatedGrid = document.getElementById('top-rated-movies');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
// Elemen Baru
const hamburgerMenu = document.getElementById('hamburger-menu');
const navWrapper = document.querySelector('.nav-wrapper');
const requestMovieBtn = document.getElementById('request-movie-btn');
const requestModal = document.getElementById('request-modal');
const closeRequestModalBtn = document.getElementById('close-request-modal');
const requestForm = document.getElementById('request-form');
const formStatus = document.getElementById('form-status');

async function fetchAPI(endpoint) { /* ... (sama seperti sebelumnya) ... */ }
function displayContent(content, container, type = 'movie') { /* ... (sama seperti sebelumnya) ... */ }
async function handleSearch(e) { /* ... (sama seperti sebelumnya) ... */ }
async function loadInitialData() { /* ... (sama seperti sebelumnya) ... */ }

// ================================ */
// == LOGIKA BARU UNTUK INTERAKSI  == */
// ================================ */

// Logika Menu Hamburger
hamburgerMenu.addEventListener('click', () => {
    navWrapper.classList.toggle('active');
});

// Logika Buka/Tutup Modal Formulir
requestMovieBtn.addEventListener('click', () => {
    requestModal.style.display = 'flex';
});
closeRequestModalBtn.addEventListener('click', () => {
    requestModal.style.display = 'none';
});
requestModal.addEventListener('click', (e) => {
    if (e.target === requestModal) {
        requestModal.style.display = 'none';
    }
});

// Logika Kirim Formulir ke Formspree
requestForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const submitButton = form.querySelector('button');

    // Tampilkan status loading
    formStatus.textContent = 'Mengirim...';
    formStatus.className = '';
    submitButton.disabled = true;
    
    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            formStatus.textContent = "Terima kasih! Request Anda telah terkirim.";
            formStatus.classList.add('success');
            form.reset();
        } else {
            const responseData = await response.json();
            if (Object.hasOwn(responseData, 'errors')) {
                formStatus.textContent = responseData["errors"].map(error => error["message"]).join(", ");
            } else {
                formStatus.textContent = "Oops! Terjadi kesalahan saat mengirim formulir.";
            }
            formStatus.classList.add('error');
        }
    } catch (error) {
        formStatus.textContent = "Oops! Terjadi kesalahan jaringan.";
        formStatus.classList.add('error');
    } finally {
        submitButton.disabled = false;
        // Hapus pesan status setelah beberapa detik
        setTimeout(() => {
            formStatus.textContent = '';
            formStatus.className = '';
        }, 5000);
    }
});

// Inisialisasi Event Listener Utama
searchForm.addEventListener('submit', handleSearch);
document.addEventListener('DOMContentLoaded', loadInitialData);

// Set action form ke endpoint Formspree kamu
// GANTI URL DI BAWAH DENGAN ENDPOINT FORM KAMU
document.getElementById('request-form').action = 'https://formspree.io/f/xblkdwlj'; 
