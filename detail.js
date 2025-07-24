const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
const STREAMING_URL_MOVIE = 'https://vidfast.pro/movie/';
const STREAMING_URL_TV = 'https://vidfast.pro/tv/';
const COUNTDOWN_SECONDS = 3;

const ADSTERRA_DIRECT_LINKS = [
    'GANTI_DENGAN_DIRECT_LINK_1',
    'GANTI_DENGAN_DIRECT_LINK_2',
    'GANTI_DENGAN_DIRECT_LINK_3',
    'GANTI_DENGAN_DIRECT_LINK_4',
    'GANTI_DENGAN_DIRECT_LINK_5'
];

// Elemen DOM
const movieDetailHero = document.getElementById('movie-detail-hero');
const detailMainContent = document.getElementById('detail-main-content');
const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const movieIframe = document.getElementById('movie-iframe');
const adTimerModal = document.getElementById('ad-timer-modal');
const adTimerCountdown = document.getElementById('ad-timer-countdown');
const adTimerContinueBtn = document.getElementById('ad-timer-continue-btn');

let countdownInterval;
let onContinueAction;

function startAdCountdown(actionAfterAd) { /* ... (fungsi ini sama) ... */ }
adTimerContinueBtn.addEventListener('click', () => { /* ... (fungsi ini sama) ... */ });
function updateMetaTags(content) { /* ... (fungsi ini sama) ... */ }
async function loadDetailPage() { /* ... (fungsi ini sama) ... */ }

function displayHeroDetail(content) {
    const title = content.title || content.name;
    const releaseDate = content.release_date || content.first_air_date;
    const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
    const runtimeInfo = content.type === 'tv' ? (content.number_of_seasons ? `${content.number_of_seasons} Seasons` : 'Info N/A') : (content.runtime ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : 'Info N/A');

    // ===============================================
    // == PERBAIKAN UTAMA ADA DI BLOK HTML DI BAWAH INI ==
    // ===============================================
    movieDetailHero.innerHTML = `
        <div class="poster-box">
            <img src="${IMG_URL + content.poster_path}" alt="${title}">
            <!-- Tombol Aksi Palsu untuk Mobile -->
            <div class="fake-action-buttons" id="fake-buttons">
                <a href="#" class="fake-btn watch"><i class="fas fa-play"></i> Watch Now</a>
                <a href="#" class="fake-btn download"><i class="fas fa-download"></i> Download</a>
            </div>
        </div>
        <div class="detail-box">
            <h1>${title}</h1>
            <div class="meta-info">
                <span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span>
                <span><i class="fas fa-star"></i> ${content.vote_average.toFixed(1)}</span>
                <span><i class="fas fa-clock"></i> ${runtimeInfo}</span>
            </div>
            <div class="genres">${content.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')}</div>
            <p class="overview">${content.overview}</p>
            <div class="action-buttons">
                <!-- Hanya tersisa tombol Play -->
                <a href="#" class="action-btn play-btn" id="play-btn" data-id="${content.id}" data-type="${content.type}"><i class="fas fa-play"></i> Play</a>
            </div>
        </div>
    `;

    // Tambahkan event listener untuk semua tombol
    document.getElementById('play-btn').addEventListener('click', handlePlayClick);

    // Tambahkan event listener untuk tombol palsu
    const fakeButtons = document.getElementById('fake-buttons').querySelectorAll('a');
    fakeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const randomIndex = Math.floor(Math.random() * ADSTERRA_DIRECT_LINKS.length);
            window.open(ADSTERRA_DIRECT_LINKS[randomIndex], '_blank');
        });
    });
}

function handlePlayClick(e) { /* ... (fungsi ini sama) ... */ }
// Fungsi handleWatchlistClick dan handleDownloadClick sudah tidak diperlukan lagi di sini
function displayTrailer(videos) { /* ... (fungsi ini sama) ... */ }
function displayActors(cast) { /* ... (fungsi ini sama) ... */ }
function displayRecommendations(recommendations, type) { /* ... (fungsi ini sama) ... */ }
closeModalBtn.addEventListener('click', () => { /* ... (fungsi ini sama) ... */ });
document.addEventListener('DOMContentLoaded', loadDetailPage);
