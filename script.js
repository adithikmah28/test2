// GANTI DENGAN API KEY TMDB KAMU!
const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';

// URL Endpoint untuk berbagai kategori film
const API_ENDPOINTS = {
    trending: `/trending/movie/week?api_key=${API_KEY}&language=id-ID`,
    popular: `/movie/popular?api_key=${API_KEY}&language=id-ID`,
    top_rated: `/movie/top_rated?api_key=${API_KEY}&language=id-ID`,
    upcoming: `/movie/upcoming?api_key=${API_KEY}&language=id-ID`,
};

const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// Memilih elemen DOM
const heroSection = document.getElementById('hero');
const mainContent = document.getElementById('main-content');
const categoryTitle = document.getElementById('category-title');
const movieGrid = document.getElementById('movie-grid');
const popularGrid = document.getElementById('popular-movies');
const topRatedGrid = document.getElementById('top-rated-movies');
const upcomingGrid = document.getElementById('upcoming-movies');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const header = document.querySelector('header');

// Fungsi untuk fetch data dari API
async function fetchMovies(endpoint) {
    try {
        const response = await fetch(BASE_URL + endpoint);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

// Fungsi untuk menampilkan film dalam grid
// GANTI FUNGSI LAMA DENGAN YANG BARU INI
function displayMovies(movies, container) {
    container.innerHTML = ''; // Kosongkan container
    movies.forEach(movie => {
        if (movie.poster_path) { // Hanya tampilkan film yang punya poster
            const movieLink = document.createElement('a');
            movieLink.href = `detail.html?id=${movie.id}`; // Link ke halaman detail
            movieLink.classList.add('movie-card'); // Kita beri style card ke link-nya

            movieLink.innerHTML = `
                <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
                </div>
            `;
            container.appendChild(movieLink);
        }
    });
}

// Fungsi untuk menampilkan Hero Section
function displayHero(movies) {
    const heroMovie = movies[Math.floor(Math.random() * 10)]; // Ambil film random dari 10 teratas
    heroSection.style.backgroundImage = `
        linear-gradient(to right, rgba(20, 20, 20, 1) 20%, rgba(20, 20, 20, 0)),
        url(${BACKDROP_URL + heroMovie.backdrop_path})
    `;
    
    const overview = heroMovie.overview.length > 200 
        ? heroMovie.overview.substring(0, 200) + '...' 
        : heroMovie.overview;

    heroSection.innerHTML = `
        <div class="hero-content">
            <h1>${heroMovie.title}</h1>
            <p>${overview}</p>
            <a href="#" class="hero-button"><i class="fas fa-play"></i> Tonton Sekarang</a>
        </div>
    `;
}

// Fungsi untuk menangani pencarian film
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();

    if (searchTerm) {
        // Sembunyikan semua kategori lain
        document.querySelectorAll('.movies-category').forEach(section => {
            if (section.querySelector('#movie-grid') === null) {
                section.style.display = 'none';
            }
        });
        
        categoryTitle.textContent = `Hasil Pencarian untuk: "${searchTerm}"`;
        const searchEndpoint = `/search/movie?api_key=${API_KEY}&language=id-ID&query=${encodeURIComponent(searchTerm)}`;
        const searchResults = await fetchMovies(searchEndpoint);
        
        if(searchResults.length > 0) {
            displayMovies(searchResults, movieGrid);
        } else {
            movieGrid.innerHTML = `<p>Film tidak ditemukan.</p>`;
        }
        
    } else {
        // Jika input kosong, tampilkan kembali halaman utama
        loadInitialData();
    }
}

// Fungsi untuk memuat semua data awal
async function loadInitialData() {
    // Tampilkan kembali semua section kategori
    document.querySelectorAll('.movies-category').forEach(section => section.style.display = 'block');
    categoryTitle.textContent = 'Film Trending Minggu Ini';
    searchInput.value = '';

    // Fetch dan tampilkan film untuk setiap kategori
    const trendingMovies = await fetchMovies(API_ENDPOINTS.trending);
    if (trendingMovies.length > 0) {
        displayHero(trendingMovies);
        displayMovies(trendingMovies, movieGrid);
    }

    const popularMovies = await fetchMovies(API_ENDPOINTS.popular);
    displayMovies(popularMovies, popularGrid);

    const topRatedMovies = await fetchMovies(API_ENDPOINTS.top_rated);
    displayMovies(topRatedMovies, topRatedGrid);

    const upcomingMovies = await fetchMovies(API_ENDPOINTS.upcoming);
    displayMovies(upcomingMovies, upcomingGrid);
}

// Event Listener untuk search
searchForm.addEventListener('submit', handleSearch);

// Event Listener untuk efek scroll pada header
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


// Panggil fungsi untuk memuat data saat halaman pertama kali dibuka
document.addEventListener('DOMContentLoaded', loadInitialData);
