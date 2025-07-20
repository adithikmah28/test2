// GANTI DENGAN API KEY TMDB KAMU!
const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// Elemen DOM
const movieDetailHero = document.getElementById('movie-detail-hero');
const trailerContainer = document.getElementById('trailer-container');
const actorsGrid = document.getElementById('actors-grid');
const recommendationsGrid = document.getElementById('recommendations-grid');

// Fungsi utama untuk memuat detail film
async function loadMovieDetail() {
    // 1. Ambil ID film dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        movieDetailHero.innerHTML = '<h1>Film tidak ditemukan.</h1>';
        return;
    }

    // 2. Fetch data lengkap film menggunakan "append_to_response"
    // Ini cara efisien untuk mengambil detail, video, credits, dan rekomendasi dalam 1 request
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID&append_to_response=videos,credits,recommendations`);
        if (!response.ok) throw new Error('Film tidak ditemukan.');
        
        const movie = await response.json();
        
        // 3. Panggil fungsi-fungsi untuk menampilkan setiap bagian
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
    // Set background
    movieDetailHero.style.backgroundImage = `url(${BACKDROP_URL + movie.backdrop_path})`;

    // Format Tanggal Rilis
    const releaseDate = new Date(movie.release_date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'numeric', year: 'numeric'
    });

    // Format Durasi
    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;
    const duration = `${hours}h ${minutes}m`;

    // Buat tag genre
    const genresHTML = movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('');

    // Masukkan semua ke HTML
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
            <div class="genres">
                ${genresHTML}
            </div>
            <p class="overview">${movie.overview}</p>
            <div class="action-buttons">
                <a href="#" class="action-btn play-btn"><i class="fas fa-play"></i> Play</a>
                <a href="#" class="action-btn watchlist-btn"><i class="fas fa-plus"></i> Add to watchlist</a>
                <a href="#" class="action-btn download-btn"><i class="fas fa-download"></i></a>
            </div>
        </div>
    `;
}

// Fungsi untuk menampilkan trailer
function displayTrailer(videos) {
    const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    if (trailer) {
        trailerContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${trailer.key}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>`;
    } else {
        document.getElementById('trailer-section').style.display = 'none'; // Sembunyikan jika tidak ada trailer
    }
}

// Fungsi untuk menampilkan aktor
function displayActors(cast) {
    actorsGrid.innerHTML = '';
    const castToShow = cast.slice(0, 12); // Tampilkan maksimal 12 aktor
    castToShow.forEach(actor => {
        const actorCard = document.createElement('div');
        actorCard.classList.add('actor-card');
        
        const profilePic = actor.profile_path 
            ? IMG_URL + actor.profile_path 
            : 'https://via.placeholder.com/150/333333/FFFFFF?text=?'; // Placeholder jika tidak ada foto

        actorCard.innerHTML = `
            <img src="${profilePic}" alt="${actor.name}">
            <h3>${actor.name}</h3>
            <p>${actor.character}</p>
        `;
        actorsGrid.appendChild(actorCard);
    });
}

// Fungsi untuk menampilkan rekomendasi (mirip dengan di halaman utama)
function displayRecommendations(movies) {
    recommendationsGrid.innerHTML = '';
    const moviesToShow = movies.slice(0, 10); // Tampilkan 10 rekomendasi
    moviesToShow.forEach(movie => {
        if (movie.poster_path) {
            const movieLink = document.createElement('a');
            movieLink.href = `detail.html?id=${movie.id}`;
            movieLink.classList.add('movie-card');
            
            movieLink.innerHTML = `
                <img src="${IMG_URL + movie.poster_path}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                </div>
            `;
            recommendationsGrid.appendChild(movieLink);
        }
    });
}


// Panggil fungsi utama saat halaman dimuat
document.addEventListener('DOMContentLoaded', loadMovieDetail);
