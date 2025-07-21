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
const hamburgerMenu = document.getElementById('hamburger-menu');
const navWrapper = document.querySelector('.nav-wrapper');
const requestMovieBtn = document.getElementById('request-movie-btn');
const requestModal = document.getElementById('request-modal');
const closeRequestModalBtn = document.getElementById('close-request-modal');
const requestForm = document.getElementById('request-form');
const formStatus = document.getElementById('form-status');

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(BASE_URL + endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.results;
    } catch (error) { console.error('Error fetching data:', error); return []; }
}

function displayContent(content, container, defaultType = 'movie') {
    container.innerHTML = '';
    content.forEach(item => {
        if ((item.media_type === 'movie' || item.media_type === 'tv' || !item.media_type) && item.poster_path) {
            const type = item.media_type || defaultType;
            const itemLink = document.createElement('a');
            itemLink.href = `detail.html?id=${item.id}&type=${type}`;
            itemLink.classList.add('movie-card');
            const title = item.title || item.name;
            itemLink.innerHTML = `<img src="${IMG_URL + item.poster_path}" alt="${title}"><div class="movie-info"><h3>${title}</h3><span><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</span></div>`;
            container.appendChild(itemLink);
        }
    });
}

async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        document.querySelectorAll('.movies-category').forEach(section => {
            if (section.querySelector('#movie-grid') === null) { section.style.display = 'none'; }
        });
        categoryTitle.textContent = `Hasil Pencarian untuk: "${searchTerm}"`;
        const searchResults = await fetchAPI(API_ENDPOINTS.multiSearch + encodeURIComponent(searchTerm));
        if (searchResults && searchResults.length > 0) {
            // PERBAIKAN DI SINI: Gunakan 'movieGrid' bukan 'movie-grid'
            displayContent(searchResults, movieGrid);
        } else {
            movieGrid.innerHTML = `<p style="color: #ccc; font-size: 1.2rem;">Tidak ada hasil ditemukan untuk "${searchTerm}".</p>`;
        }
    } else {
        loadInitialData();
    }
}

async function loadInitialData() {
    document.querySelectorAll('.movies-category').forEach(section => section.style.display = 'block');
    categoryTitle.textContent = 'Film Trending Minggu Ini';
    searchInput.value = '';
    const [trendingMovies, indonesianMovies, popularTV, popularMovies, topRatedMovies] = await Promise.all([
        fetchAPI(API_ENDPOINTS.trendingMovies), 
        fetchAPI(API_ENDPOINTS.indonesianMovies),
        fetchAPI(API_ENDPOINTS.popularTV),
        fetchAPI(API_ENDPOINTS.popularMovies),
        fetchAPI(API_ENDPOINTS.topRatedMovies)
    ]);
    displayContent(trendingMovies, movieGrid, 'movie');
    displayContent(indonesianMovies, indonesianMoviesGrid, 'movie');
    displayContent(popularTV, tvSeriesGrid, 'tv');
    displayContent(popularMovies, popularGrid, 'movie');
    displayContent(topRatedMovies, topRatedGrid, 'movie');
}

// Event Listener
hamburgerMenu.addEventListener('click', () => { navWrapper.classList.toggle('active'); });
requestMovieBtn.addEventListener('click', () => { requestModal.style.display = 'flex'; });
closeRequestModalBtn.addEventListener('click', () => { requestModal.style.display = 'none'; });
requestModal.addEventListener('click', (e) => { if (e.target === requestModal) { requestModal.style.display = 'none'; } });

requestForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const submitButton = form.querySelector('button');
    formStatus.textContent = 'Mengirim...';
    formStatus.className = '';
    submitButton.disabled = true;
    try {
        const response = await fetch(form.action, { method: form.method, body: data, headers: { 'Accept': 'application/json' } });
        if (response.ok) {
            formStatus.textContent = "Terima kasih! Request Anda telah terkirim.";
            formStatus.classList.add('success');
            form.reset();
        } else {
            formStatus.textContent = "Oops! Terjadi kesalahan saat mengirim formulir.";
            formStatus.classList.add('error');
        }
    } catch (error) {
        formStatus.textContent = "Oops! Terjadi kesalahan jaringan.";
        formStatus.classList.add('error');
    } finally {
        submitButton.disabled = false;
        setTimeout(() => { formStatus.textContent = ''; formStatus.className = ''; }, 5000);
    }
});

searchForm.addEventListener('submit', handleSearch);
document.addEventListener('DOMContentLoaded', loadInitialData);
document.getElementById('request-form').action = 'https://formspree.io/f/xblkdwlj';
