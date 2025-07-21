const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_ENDPOINTS = {
    trending: `/trending/movie/week?api_key=${API_KEY}&language=id-ID`,
    popularMovies: `/movie/popular?api_key=${API_KEY}&language=id-ID`,
    topRatedMovies: `/movie/top_rated?api_key=${API_KEY}&language=id-ID`,
    popularTV: `/tv/popular?api_key=${API_KEY}&language=id-ID`, // <-- BARU
};
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

const heroSection = document.getElementById('hero');
const categoryTitle = document.getElementById('category-title');
const movieGrid = document.getElementById('movie-grid');
const popularGrid = document.getElementById('popular-movies');
const topRatedGrid = document.getElementById('top-rated-movies');
const tvSeriesGrid = document.getElementById('tv-series-grid'); // <-- BARU
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const header = document.querySelector('header');

async function fetchAPI(endpoint) {
    try {
        const response = await fetch(BASE_URL + endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.results;
    } catch (error) { console.error('Error fetching data:', error); return []; }
}

function displayContent(content, container, type = 'movie') {
    container.innerHTML = '';
    content.forEach(item => {
        if (item.poster_path) {
            const itemLink = document.createElement('a');
            // Link ke detail.html sambil membawa tipe konten (movie/tv)
            itemLink.href = `detail.html?id=${item.id}&type=${type}`;
            itemLink.classList.add('movie-card');
            
            const title = item.title || item.name; // Judul untuk movie, name untuk TV
            itemLink.innerHTML = `<img src="${IMG_URL + item.poster_path}" alt="${title}"><div class="movie-info"><h3>${title}</h3><span><i class="fas fa-star"></i> ${item.vote_average.toFixed(1)}</span></div>`;
            container.appendChild(itemLink);
        }
    });
}

function displayHero(movies) { /* ... (fungsi ini sama) ... */ }
async function handleSearch(e) { /* ... (fungsi ini sama, tapi mungkin perlu di-upgrade nanti) ... */ }

async function loadInitialData() {
    document.querySelectorAll('.movies-category').forEach(section => section.style.display = 'block');
    categoryTitle.textContent = 'Film Trending Minggu Ini';
    searchInput.value = '';
    const [trending, popularMovies, topRatedMovies, popularTV] = await Promise.all([
        fetchAPI(API_ENDPOINTS.trending),
        fetchAPI(API_ENDPOINTS.popularMovies),
        fetchAPI(API_ENDPOINTS.topRatedMovies),
        fetchAPI(API_ENDPOINTS.popularTV) // <-- BARU
    ]);
    if (trending.length > 0) { displayHero(trending); displayContent(trending, movieGrid, 'movie'); }
    displayContent(popularMovies, popularGrid, 'movie');
    displayContent(topRatedMovies, topRatedGrid, 'movie');
    displayContent(popularTV, tvSeriesGrid, 'tv'); // <-- BARU
}

searchForm.addEventListener('submit', handleSearch);
window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 50); });
document.addEventListener('DOMContentLoaded', loadInitialData);
