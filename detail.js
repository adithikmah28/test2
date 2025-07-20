// GANTI SEMUA ISI FILE detail.js KAMU DENGAN KODE INI

const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
// URL untuk embed film dari sumber eksternal
const MOVIE_SRC_URL = 'https://vidsrc.to/embed/movie/'; // Format: https://vidsrc.to/embed/movie/{TMDB_ID}

// Elemen DOM
const movieDetailHero = document.getElementById('movie-detail-hero');
const actorsGrid = document.getElementById('actors-grid');
const recommendationsGrid = document.getElementById('recommendations-grid');
// Tambahan untuk Trailer (jika ada) & Modal
const trailerContainer = document.getElementById('trailer-container');
const trailerSection = document.getElementById('trailer-section');
const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const movieIframe = document.getElementById('movie-iframe');

// === FUNGSI-FUNGSI UNTUK WATCHLIST ===
// Mendapatkan watchlist dari localStorage
function getWatchlist() {
    return JSON.parse(localStorage.getItem('cinebroWatchlist')) || [];
}

// Menyimpan watchlist ke localStorage
function saveWatchlist(watchlist) {
    localStorage.setItem('cinebroWatchlist', JSON.stringify(watchlist));
}

// Fungsi utama untuk memuat detail film
async function loadMovieDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        movieDetailHero.innerHTML = '<h1>Film tidak ditemukan.</h1>';
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID&append_to_response=videos,credits,recommendations`);
        if (!response.ok) throw new Error('Film tidak ditemukan.');
        
        const movie = await response.json();
        
        // Cek jika sinopsis kosong, ambil dari bahasa inggris
        if (!movie.overview) {
            const englishResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
            const englishMovie = await englishResponse.json();
            movie.overview = englishMovie.overview || "Maaf, sinopsis untuk film ini belum tersedia.";
        }
        
        displayHeroDetail(movie);
        displayTrailer(movie.videos.results);
        displayActors(movie.credits.cast);
        displayRecommendations(movie.recommendations.results);

    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetailHero.innerHTML = `<h1>Error: ${error.message}</h1>`;
    }
}

// Fungsi untuk menampilkan bagian Hero (info utama film)
function displayHeroDetail(movie) {
    movieDetailHero.style.backgroundImage = `url(${BACKDROP_URL + movie.backdrop_path})`;

    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }) : 'N/A';
    const duration = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
    const genresHTML = movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('');
    
    // Cek apakah film ini ada di watchlist
    const watchlist = getWatchlist();
    const isInWatchlist = watchlist.includes(movie.id.toString());

    movieDetailHero.innerHTML = `
        <div class="poster-box">
            <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
        </div>
        <div class="detail-box">
            <h1>${movie.title}</h1>
            <div class="meta-info">
                <span><i class="fas fa-calendar-alt"></i> ${releaseDate}</span>
                <span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span>
                <span><i class="fas fa-clock"></i> ${duration}</span>
            </div>
            <div class="genres">${genresHTML}</div>
            <p class="overview">${movie.overview}</p>
            <div class="action-buttons">
                <a href="#" class="action-btn play-btn" id="play-movie-btn" data-movie-id="${movie.id}"><i class="fas fa-play"></i> Play</a>
                <a href="#" class="action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" id="watchlist-btn" data-movie-id="${movie.id}">
                    <i class="fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i> ${isInWatchlist ? 'In Watchlist' : 'Add to watchlist'}
                </a>
            </div>
        </div>
    `;

    // Setelah HTML di-render, tambahkan event listener ke tombol yang baru dibuat
    document.getElementById('play-movie-btn').addEventListener('click', handlePlayClick);
    document.getElementById('watchlist-btn').addEventListener('click', handleWatchlistClick);
}

// === FUNGSI-FUNGSI BARU UNTUK INTERAKSI ===

// Handler untuk tombol Play
function handlePlayClick(e) {
    e.preventDefault();
    const movieId = e.currentTarget.dataset.movieId;
    movieIframe.src = `${MOVIE_SRC_URL}${movieId}`; // Set sumber iframe
    videoModal.style.display = 'flex'; // Tampilkan modal
}

// Handler untuk tombol Watchlist
function handleWatchlistClick(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const movieId = button.dataset.movieId;
    let watchlist = getWatchlist();
    
    if (watchlist.includes(movieId)) {
        // Hapus dari watchlist
        watchlist = watchlist.filter(id => id !== movieId);
        button.classList.remove('active');
        button.innerHTML = `<i class="fas fa-plus"></i> Add to watchlist`;
    } else {
        // Tambah ke watchlist
        watchlist.push(movieId);
        button.classList.add('active');
        button.innerHTML = `<i class="fas fa-check"></i> In Watchlist`;
    }
    
    saveWatchlist(watchlist); // Simpan perubahan
}


// Fungsi untuk menampilkan trailer (sama seperti sebelumnya)
function displayTrailer(videos) {
    const trailer = videos.find(video => (video.type === 'Trailer' || video.type === 'Teaser') && video.site === 'YouTube');
    trailerSection.style.display = 'block';
    if (trailer) {
        trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } else {
        trailerContainer.style.backgroundColor = '#000';
        trailerContainer.style.display = 'flex';
        trailerContainer.style.alignItems = 'center';
        trailerContainer.style.justifyContent = 'center';
        trailerContainer.innerHTML = `<p style="color: #aaa; font-size: 1.2rem;">Trailer resmi belum tersedia.</p>`;
    }
}

// Fungsi untuk menampilkan aktor (tidak berubah)
function displayActors(cast) {
    actorsGrid.innerHTML = '';
    const castToShow = cast.slice(0, 12);
    castToShow.forEach(actor => {
        const actorCard = document.createElement('div');
        actorCard.classList.add('actor-card');
        const profilePic = actor.profile_path ? IMG_URL + actor.profile_path : 'https://via.placeholder.com/150/333333/FFFFFF?text=?';
        actorCard.innerHTML = `<img src="${profilePic}" alt="${actor.name}"><h3>${actor.name}</h3><p>${actor.character}</p>`;
        actorsGrid.appendChild(actorCard);
    });
}

// Fungsi untuk menampilkan rekomendasi (tidak berubah)
function displayRecommendations(movies) {
    recommendationsGrid.innerHTML = '';
    movies.slice(0, 10).forEach(movie => {
        if (movie.poster_path) {
            const movieLink = document.createElement('a');
            movieLink.href = `detail.html?id=${movie.id}`;
            movieLink.classList.add('movie-card');
            movieLink.innerHTML = `<img src="${IMG_URL + movie.poster_path}" alt="${movie.title}"><div class="movie-info"><h3>${movie.title}</h3></div>`;
            recommendationsGrid.appendChild(movieLink);
        }
    });
}

// Event listener untuk menutup modal
closeModalBtn.addEventListener('click', () => {
    videoModal.style.display = 'none';
    movieIframe.src = ''; // Hentikan video saat modal ditutup
});

// Panggil fungsi utama saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadMovieDetail);
