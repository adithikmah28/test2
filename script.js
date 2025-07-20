const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const API_ENDPOINTS = {
    trending: `/trending/movie/week?api_key=${API_KEY}&language=id-ID`,
    popular: `/movie/popular?api_key=${API_KEY}&language=id-ID`,
    top_rated: `/movie/top_rated?api_key=${API_KEY}&language=id-ID`,
    upcoming: `/movie/upcoming?api_key=${API_KEY}&language=id-ID`,
};
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

const heroSection = document.getElementById('hero');
const categoryTitle = document.getElementById('category-title');
const movieGrid = document.getElementById('movie-grid');
const popularGrid = document.getElementById('popular-movies');
const topRatedGrid = document.getElementById('top-rated-movies');
const upcomingGrid = document.getElementById('upcoming-movies');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const header = document.querySelector('header');

async function fetchMovies(endpoint) {
    try {
        const response = await fetch(BASE_URL + endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        return data.results;
    } catch (error) { console.error('Error fetching movies:', error); return []; }
}

function displayMovies(movies, container) {
    container.innerHTML = '';
    movies.forEach(movie => {
        if (movie.poster_path) {
            const movieLink = document.createElement('a');
            movieLink.href = `detail.html?id=${movie.id}`;
            movieLink.classList.add('movie-card');
            movieLink.innerHTML = `<img src="${IMG_URL + movie.poster_path}" alt="${movie.title}"><div class="movie-info"><h3>${movie.title}</h3><span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span></div>`;
            container.appendChild(movieLink);
        }
    });
}

function displayHero(movies) {
    const heroMovie = movies[Math.floor(Math.random() * 10)];
    heroSection.style.backgroundImage = `linear-gradient(to right, rgba(20, 20, 20, 1) 20%, rgba(20, 20, 20, 0)), url(${BACKDROP_URL + heroMovie.backdrop_path})`;
    const overview = heroMovie.overview.length > 200 ? heroMovie.overview.substring(0, 200) + '...' : heroMovie.overview;
    heroSection.innerHTML = `<div class="hero-content"><h1>${heroMovie.title}</h1><p>${overview}</p><a href="detail.html?id=${heroMovie.id}" class="hero-button"><i class="fas fa-info-circle"></i> Info Lengkap</a></div>`;
}

async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        document.querySelectorAll('.movies-category').forEach(section => { if (section.querySelector('#movie-grid') === null) section.style.display = 'none'; });
        categoryTitle.textContent = `Hasil Pencarian untuk: "${searchTerm}"`;
        const searchResults = await fetchMovies(`/search/movie?api_key=${API_KEY}&language=id-ID&query=${encodeURIComponent(searchTerm)}`);
        if(searchResults.length > 0) displayMovies(searchResults, movieGrid); else movieGrid.innerHTML = `<p>Film tidak ditemukan.</p>`;
    } else { loadInitialData(); }
}

async function loadInitialData() {
    document.querySelectorAll('.movies-category').forEach(section => section.style.display = 'block');
    categoryTitle.textContent = 'Film Trending Minggu Ini';
    searchInput.value = '';
    const [trending, popular, topRated, upcoming] = await Promise.all([
        fetchMovies(API_ENDPOINTS.trending), fetchMovies(API_ENDPOINTS.popular),
        fetchMovies(API_ENDPOINTS.top_rated), fetchMovies(API_ENDPOINTS.upcoming)
    ]);
    if (trending.length > 0) { displayHero(trending); displayMovies(trending, movieGrid); }
    displayMovies(popular, popularGrid);
    displayMovies(topRated, topRatedGrid);
    displayMovies(upcoming, upcomingGrid);
}

searchForm.addEventListener('submit', handleSearch);
window.addEventListener('scroll', () => { header.classList.toggle('scrolled', window.scrollY > 50); });
document.addEventListener('DOMContentLoaded', loadInitialData);
