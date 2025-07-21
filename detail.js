const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// URL Sumber Default
const STREAMING_URL_MOVIE = 'https://vidfast.pro/movie/';
const STREAMING_URL_TV = 'https://vidfast.pro/tv/';

// Monetisasi
const ADSTERRA_DIRECT_LINK = 'GANTI_DENGAN_DIRECT_LINK_ADSTERRA_ANDA';
const COUNTDOWN_SECONDS = 3;

// ==========================================================
// == DATABASE KUSTOM UNTUK FILM YANG TIDAK ADA DI VIDFAST ==
// ==========================================================
// Format: 'TMDB_ID': 'URL_STREAMING_KUSTOM_ANDA'
const customSources = {
    '624566': 'https://www.yourvideolink.com/makmum.mp4', // <-- GANTI DENGAN LINK VIDEO MAKMUM KAMU
    
    // Contoh lain: Film "KKN di Desa Penari" (TMDB ID: 942230)
    '942230': 'https://link.googledrive.com/file/d/xxxx', // <-- GANTI DENGAN LINK-MU
    
    // Tambahkan film lain di sini dengan format yang sama
    // 'ID_LAIN': 'URL_LAIN',
};
// ==========================================================

// Elemen DOM
const movieDetailHero = document.getElementById('movie-detail-hero');
const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const movieIframe = document.getElementById('movie-iframe');
const adTimerModal = document.getElementById('ad-timer-modal');
const adTimerCountdown = document.getElementById('ad-timer-countdown');
const adTimerContinueBtn = document.getElementById('ad-timer-continue-btn');
const trailerSection = document.getElementById('trailer-section');

let countdownInterval;
let onContinueAction;

// Fungsi untuk monetisasi (tidak berubah)
function startAdCountdown(actionAfterAd) {
    onContinueAction = actionAfterAd;
    window.open(ADSTERRA_DIRECT_LINK, '_blank');
    adTimerModal.style.display = 'flex';
    adTimerContinueBtn.style.display = 'none';
    adTimerCountdown.style.display = 'block';
    let secondsLeft = COUNTDOWN_SECONDS;
    adTimerCountdown.innerHTML = `Link akan terbuka dalam <span>${secondsLeft}</span> detik...`;
    countdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
            adTimerCountdown.querySelector('span').textContent = secondsLeft;
        } else {
            clearInterval(countdownInterval);
            adTimerCountdown.style.display = 'none';
            adTimerContinueBtn.style.display = 'inline-block';
        }
    }, 1000);
}

// Event listener tombol "Lanjutkan" di modal iklan (tidak berubah)
adTimerContinueBtn.addEventListener('click', () => {
    adTimerModal.style.display = 'none';
    clearInterval(countdownInterval);
    if (typeof onContinueAction === 'function') { onContinueAction(); }
});

// Fungsi Watchlist (tidak berubah)
function getWatchlist() { return JSON.parse(localStorage.getItem('cinebroWatchlist')) || []; }
function saveWatchlist(watchlist) { localStorage.setItem('cinebroWatchlist', JSON.stringify(watchlist)); }

// Fungsi utama untuk memuat halaman detail (tidak berubah)
async function loadDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const contentType = urlParams.get('type') || 'movie';
    if (!contentId) { movieDetailHero.innerHTML = '<h1>Konten tidak ditemukan.</h1>'; return; }
    try {
        const endpoint = `/${contentType}/${contentId}`;
        const [indonesianData, englishData] = await Promise.all([
            fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=id-ID&append_to_response=videos,credits,recommendations`),
            fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US&append_to_response=videos`)
        ]);
        if (!indonesianData.ok) throw new Error('Konten tidak ditemukan.');
        let data = await indonesianData.json();
        const englishDataJson = await englishData.json();
        data.overview = data.overview || englishDataJson.overview || "Sinopsis belum tersedia.";
        data.videos = { results: (data.videos && data.videos.results.length > 0) ? data.videos.results : englishDataJson.videos.results };
        const finalContent = { ...data, type: contentType };
        document.title = `${finalContent.title || finalContent.name} - CineBro`;
        displayHeroDetail(finalContent);
        displayTrailer(finalContent.videos.results);
        displayActors(finalContent.credits.cast);
        displayRecommendations(finalContent.recommendations.results, contentType);
    } catch (error) { console.error("Error:", error); movieDetailHero.innerHTML = `<h1>Error memuat data.</h1>`; }
}

// Fungsi untuk menampilkan bagian Hero (tidak berubah)
function displayHeroDetail(content) {
    const title = content.title || content.name;
    const releaseDate = content.release_date || content.first_air_date;
    const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
    const runtimeInfo = content.type === 'tv' ? `${content.number_of_seasons} Seasons` : (content.runtime ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : 'N/A');
    const isInWatchlist = getWatchlist().includes(content.id.toString());
    movieDetailHero.innerHTML = `<div class="poster-box"><img src="${IMG_URL + content.poster_path}" alt="${title}"></div><div class="detail-box"><h1>${title}</h1><div class="meta-info"><span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span><span><i class="fas fa-star"></i> ${content.vote_average.toFixed(1)}</span><span><i class="fas fa-clock"></i> ${runtimeInfo}</span></div><div class="genres">${content.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')}</div><p class="overview">${content.overview}</p><div class="action-buttons"><a href="#" class="action-btn play-btn" id="play-btn" data-id="${content.id}" data-type="${content.type}"><i class="fas fa-play"></i> Play</a><a href="#" class="action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" id="watchlist-btn" data-content-id="${content.id}"><i class="fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i> ${isInWatchlist ? 'In Watchlist' : 'Add to watchlist'}</a><a href="download.html?id=${content.id}&type=${content.type}" class="action-btn download-btn"><i class="fas fa-download"></i></a></div></div>`;
    document.getElementById('play-btn').addEventListener('click', handlePlayClick);
    document.getElementById('watchlist-btn').addEventListener('click', handleWatchlistClick);
}

// ==========================================================
// == FUNGSI PLAY YANG SUDAH DIPERBARUI DENGAN LOGIKA KUSTOM ==
// ==========================================================
function handlePlayClick(e) {
    e.preventDefault();
    const { id, type } = e.currentTarget.dataset;
    let streamUrl;

    // Cek dulu di database kustom kita
    if (customSources[id]) {
        streamUrl = customSources[id];
        console.log(`Memuat dari sumber kustom untuk ID: ${id}`);
    } else {
        // Jika tidak ada, gunakan sumber default
        if (type === 'tv') {
            streamUrl = `${STREAMING_URL_TV}${id}/1/1`;
        } else {
            streamUrl = `${STREAMING_URL_MOVIE}${id}`;
        }
        console.log(`Memuat dari sumber default (Vidfast) untuk ID: ${id}`);
    }

    // Jalankan monetisasi sebelum memutar
    startAdCountdown(() => {
        movieIframe.src = streamUrl;
        videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// Fungsi untuk menangani klik tombol Watchlist (tidak berubah)
function handleWatchlistClick(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const contentId = button.dataset.contentId;
    let watchlist = getWatchlist();
    if (watchlist.includes(contentId)) {
        watchlist = watchlist.filter(id => id !== contentId);
        button.classList.remove('active');
        button.innerHTML = `<i class="fas fa-plus"></i> Add to watchlist`;
    } else {
        watchlist.push(contentId);
        button.classList.add('active');
        button.innerHTML = `<i class="fas fa-check"></i> In Watchlist`;
    }
    saveWatchlist(watchlist);
}

// Fungsi-fungsi lain untuk menampilkan konten (Trailer, Aktor, Rekomendasi) - tidak berubah
function displayTrailer(videos) {
    if (!trailerSection) return;
    const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube');
    const firstVideo = videos.find(v => v.site === 'YouTube');
    const trailer = officialTrailer || teaser || firstVideo;
    if (trailer) {
        trailerSection.style.display = 'block';
        trailerSection.innerHTML = `<h2>Trailer</h2><div id="trailer-container"><iframe src="https://www.youtube.com/embed/${trailer.key}" title="YouTube video player" allowfullscreen></iframe></div>`;
    } else {
        trailerSection.style.display = 'none';
    }
}

function displayActors(cast) {
    const actorsGrid = document.getElementById('actors-grid');
    if (!actorsGrid) return;
    actorsGrid.innerHTML = '';
    cast.slice(0, 12).forEach(actor => {
        if (actor.profile_path) {
            const actorCard = document.createElement('div');
            actorCard.classList.add('actor-card');
            actorCard.innerHTML = `<img src="${IMG_URL + actor.profile_path}" alt="${actor.name}"><h3>${actor.name}</h3><p>${actor.character}</p>`;
            actorsGrid.appendChild(actorCard);
        }
    });
}

function displayRecommendations(recommendations, type) {
    const recGrid = document.getElementById('recommendations-grid');
    if (!recGrid) return;
    recGrid.innerHTML = '';
    recommendations.slice(0, 10).forEach(item => {
        if (item.poster_path) {
            const link = document.createElement('a');
            link.href = `detail.html?id=${item.id}&type=${type}`;
            link.classList.add('movie-card');
            const title = item.title || item.name;
            link.innerHTML = `<img src="${IMG_URL + item.poster_path}" alt="${title}"><div class="movie-info"><h3>${title}</h3></div>`;
            recGrid.appendChild(link);
        }
    });
}

// Event listener untuk menutup modal video (tidak berubah)
closeModalBtn.addEventListener('click', () => {
    movieIframe.src = ''; 
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Event listener untuk memulai semua proses saat halaman dimuat (tidak berubah)
document.addEventListener('DOMContentLoaded', loadDetailPage);
