const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
// URL SUMBER BARU UNTUK MOVIE & TV
const STREAMING_URL_MOVIE = 'https://vidfast.pro/movie/';
const STREAMING_URL_TV = 'https://vidfast.pro/tv/';

const ADSTERRA_DIRECT_LINK = 'GANTI_DENGAN_DIRECT_LINK_ADSTERRA_ANDA';
const COUNTDOWN_SECONDS = 3;

// ... (semua elemen DOM lainnya sama)
const movieDetailHero = document.getElementById('movie-detail-hero');
const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const movieIframe = document.getElementById('movie-iframe');
// ... (semua elemen modal iklan sama)
const adTimerModal = document.getElementById('ad-timer-modal');
const adTimerCountdown = document.getElementById('ad-timer-countdown');
const adTimerContinueBtn = document.getElementById('ad-timer-continue-btn');
// Elemen baru untuk TV
const trailerSection = document.getElementById('trailer-section');
const seasonsSection = document.getElementById('seasons-section');
const seasonSelect = document.getElementById('season-select');
const episodesGrid = document.getElementById('episodes-grid');

let currentContent; // Menyimpan data movie/tv saat ini
let countdownInterval;
let onContinueAction;

// ... (fungsi startAdCountdown, getWatchlist, saveWatchlist sama)

async function loadDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const contentType = urlParams.get('type') || 'movie'; // Default ke 'movie' jika tidak ada

    if (!contentId) { /* ... (sama) */ return; }

    try {
        const endpoint = `/${contentType}/${contentId}`;
        const [indonesianData, englishData] = await Promise.all([
            fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=id-ID&append_to_response=videos,credits,recommendations`),
            fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&append_to_response=videos`)
        ]);

        if (!indonesianData.ok) throw new Error('Konten tidak ditemukan.');
        
        let data = await indonesianData.json();
        const englishDataJson = await englishData.json();

        // Gabungkan data (sinopsis dan video)
        data.overview = data.overview || englishDataJson.overview || "Sinopsis belum tersedia.";
        data.videos = { results: data.videos?.results.length > 0 ? data.videos.results : englishDataJson.videos.results };
        
        currentContent = { ...data, type: contentType };
        document.title = `${data.title || data.name} - CineBro`;

        displayHeroDetail(currentContent);
        displayActors(currentContent.credits.cast);
        displayRecommendations(currentContent.recommendations.results, contentType);

        if (contentType === 'tv') {
            trailerSection.style.display = 'none';
            seasonsSection.style.display = 'block';
            displaySeasons(currentContent.seasons);
        } else {
            seasonsSection.style.display = 'none';
            trailerSection.style.display = 'block';
            displayTrailer(currentContent.videos.results);
        }

    } catch (error) { /* ... (sama) */ }
}

function displayHeroDetail(content) {
    const title = content.title || content.name;
    const releaseDate = content.release_date || content.first_air_date;
    const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
    // Info tambahan untuk TV
    const runtimeInfo = content.type === 'tv' 
        ? `${content.number_of_seasons} Seasons` 
        : (content.runtime ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : 'N/A');
    
    // ... (sisa logika sama, pastikan menggunakan variabel title, formattedDate, dll.)
    
    // Tombol Play disembunyikan untuk TV, karena play dilakukan dari tombol episode
    const playButtonHTML = content.type === 'movie' 
        ? `<a href="#" class="action-btn play-btn" id="play-movie-btn" data-movie-id="${content.id}"><i class="fas fa-play"></i> Play</a>`
        : '';

    movieDetailHero.innerHTML = `... (Gunakan variabel baru di sini, dan sisipkan playButtonHTML) ...`;

    if (content.type === 'movie') {
        document.getElementById('play-movie-btn').addEventListener('click', handlePlayClick);
    }
    // ... (event listener watchlist & download sama)
}

function displaySeasons(seasons) {
    seasonSelect.innerHTML = '';
    seasons.forEach(season => {
        if (season.season_number > 0) { // Seringkali Season 0 itu "Specials"
            const option = document.createElement('option');
            option.value = season.season_number;
            option.textContent = season.name;
            seasonSelect.appendChild(option);
        }
    });
    // Tampilkan episode untuk season pertama saat halaman dimuat
    displayEpisodesForSeason(seasonSelect.value);

    // Tambahkan event listener untuk ganti season
    seasonSelect.addEventListener('change', (e) => displayEpisodesForSeason(e.target.value));
}

async function displayEpisodesForSeason(seasonNumber) {
    const tvId = currentContent.id;
    const response = await fetch(`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${API_KEY}&language=id-ID`);
    const seasonData = await response.json();
    
    episodesGrid.innerHTML = '';
    seasonData.episodes.forEach(episode => {
        const episodeBtn = document.createElement('button');
        episodeBtn.className = 'episode-btn';
        episodeBtn.dataset.tvId = tvId;
        episodeBtn.dataset.season = seasonNumber;
        episodeBtn.dataset.episode = episode.episode_number;
        
        episodeBtn.innerHTML = `
            E${episode.episode_number}
            <span>${episode.name}</span>
        `;
        episodeBtn.addEventListener('click', handleEpisodeClick);
        episodesGrid.appendChild(episodeBtn);
    });
}

function handleEpisodeClick(e) {
    const btn = e.currentTarget;
    const { tvId, season, episode } = btn.dataset;
    const streamUrl = `${STREAMING_URL_TV}${tvId}/${season}/${episode}`;

    // Jalankan monetisasi
    startAdCountdown(() => {
        movieIframe.src = streamUrl;
        videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

function handlePlayClick(e) {
    // Fungsi ini sekarang HANYA untuk movie
    e.preventDefault();
    const movieId = e.currentTarget.dataset.movieId;
    startAdCountdown(() => {
        movieIframe.src = STREAMING_URL_MOVIE + movieId;
        videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// ... (semua fungsi lain tetap sama)
// Pastikan ganti nama fungsi loadMovieDetail menjadi loadDetailPage di event listener terakhir.
document.addEventListener('DOMContentLoaded', loadDetailPage);
