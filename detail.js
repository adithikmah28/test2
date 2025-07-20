// GANTI SEMUA ISI FILE detail.js KAMU DENGAN KODE INI

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
const trailerSection = document.getElementById('trailer-section'); // Tambahkan ini

// Fungsi utama untuk memuat detail film
async function loadMovieDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        movieDetailHero.innerHTML = '<h1>Film tidak ditemukan.</h1>';
        return;
    }

    try {
        // --- PERUBAHAN PENTING 1: Fetch data dalam 2 bahasa sekaligus ---
        // Kita ambil data dalam bahasa Indonesia (id-ID) dan Inggris (en-US) sebagai cadangan.
        const [indonesianData, englishData] = await Promise.all([
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID&append_to_response=videos,credits,recommendations`),
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos`) // Cukup ambil video untuk cadangan trailer
        ]);

        if (!indonesianData.ok) throw new Error('Film tidak ditemukan.');
        
        const movie = await indonesianData.json();
        const movieEnglish = await englishData.json();

        // Gabungkan data untuk mendapatkan yang terbaik dari keduanya
        const finalMovieData = {
            ...movie,
            // Cek sinopsis, jika versi indo kosong, pakai versi inggris
            overview: movie.overview || movieEnglish.overview || "Maaf, sinopsis untuk film ini belum tersedia.",
            // Cek video, jika versi indo kosong, pakai versi inggris
            videos: {
                results: movie.videos.results.length > 0 ? movie.videos.results : movieEnglish.videos.results
            }
        };
        
        displayHeroDetail(finalMovieData);
        displayTrailer(finalMovieData.videos.results); // Gunakan data video yang sudah digabung
        displayActors(finalMovieData.credits.cast);
        displayRecommendations(finalMovieData.recommendations.results);

    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetailHero.innerHTML = `<h1>Error: ${error.message}</h1>`;
    }
}

// Fungsi untuk menampilkan bagian Hero (info utama film)
function displayHeroDetail(movie) {
    movieDetailHero.style.backgroundImage = `url(${BACKDROP_URL + movie.backdrop_path})`;

    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'numeric', year: 'numeric'
    }) : 'N/A';

    const hours = Math.floor(movie.runtime / 60);
    const minutes = movie.runtime % 60;
    const duration = movie.runtime ? `${hours}h ${minutes}m` : 'N/A';

    const genresHTML = movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('');

    // --- PERUBAHAN PENTING 2: Gunakan sinopsis yang sudah di-fallback ---
    // Variabel `movie.overview` di sini sudah pasti berisi sesuatu (sinopsis indo/inggris/pesan error).
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
    // Cari trailer resmi atau teaser apa pun dari YouTube
    const trailer = videos.find(video => (video.type === 'Trailer' || video.type === 'Teaser') && video.site === 'YouTube');
    
    // --- PERUBAHAN PENTING 3: Logika baru untuk trailer ---
    trailerSection.style.display = 'block'; // Pastikan section trailer selalu terlihat

    if (trailer) {
        // Jika trailer ditemukan, tampilkan iframe YouTube
        trailerContainer.innerHTML = `
            <iframe src="https://www.youtube.com/embed/${trailer.key}" 
                    title="YouTube video player" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
            </iframe>`;
    } else {
        // Jika tidak ada trailer, tampilkan pesan di dalam kotak video
        trailerContainer.style.backgroundColor = '#000'; // Beri background hitam
        trailerContainer.style.display = 'flex';
        trailerContainer.style.alignItems = 'center';
        trailerContainer.style.justifyContent = 'center';
        trailerContainer.innerHTML = `<p style="color: #aaa; font-size: 1.2rem;">Trailer belum tersedia.</p>`;
    }
}

// Fungsi untuk menampilkan aktor (tidak ada perubahan)
function displayActors(cast) {
    actorsGrid.innerHTML = '';
    const castToShow = cast.slice(0, 12);
    castToShow.forEach(actor => {
        const actorCard = document.createElement('div');
        actorCard.classList.add('actor-card');
        const profilePic = actor.profile_path ? IMG_URL + actor.profile_path : 'https://via.placeholder.com/150/333333/FFFFFF?text=?';
        actorCard.innerHTML = `
            <img src="${profilePic}" alt="${actor.name}">
            <h3>${actor.name}</h3>
            <p>${actor.character}</p>
        `;
        actorsGrid.appendChild(actorCard);
    });
}

// Fungsi untuk menampilkan rekomendasi (tidak ada perubahan)
function displayRecommendations(movies) {
    recommendationsGrid.innerHTML = '';
    const moviesToShow = movies.slice(0, 10);
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

document.addEventListener('DOMContentLoaded', loadMovieDetail);
