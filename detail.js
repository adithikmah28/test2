const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
const STREAMING_URL_MOVIE = 'https://vidfast.pro/movie/';
const STREAMING_URL_TV = 'https://vidfast.pro/tv/';
const ADSTERRA_DIRECT_LINK = 'GANTI_DENGAN_DIRECT_LINK_ADSTERRA_ANDA';
const COUNTDOWN_SECONDS = 3;

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

// Fungsi Monetisasi (tidak berubah)
function startAdCountdown(actionAfterAd) {
    onContinueAction = actionAfterAd;
    // Pengecekan sederhana jika ADSTERRA_DIRECT_LINK belum diisi
    if (ADSTERRA_DIRECT_LINK.startsWith('GANTI_DENGAN')) {
        console.warn("Adsterra Direct Link belum diatur. Melewati iklan.");
        if (typeof onContinueAction === 'function') { onContinueAction(); }
        return;
    }
    const randomIndex = Math.floor(Math.random() * ADSTERRA_DIRECT_LINKS.length);
    const selectedDirectLink = ADSTERRA_DIRECT_LINKS[randomIndex];
    window.open(selectedDirectLink, '_blank');
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
adTimerContinueBtn.addEventListener('click', () => {
    adTimerModal.style.display = 'none';
    clearInterval(countdownInterval);
    if (typeof onContinueAction === 'function') { onContinueAction(); }
});

// Fungsi Watchlist (tidak berubah)
function getWatchlist() { return JSON.parse(localStorage.getItem('cinebroWatchlist')) || []; }
function saveWatchlist(watchlist) { localStorage.setItem('cinebroWatchlist', JSON.stringify(watchlist)); }

// Fungsi Update Meta Tags (tidak berubah)
function updateMetaTags(content) { /* ... (fungsi ini sama) ... */ }

// Fungsi Utama untuk Memuat Halaman
async function loadDetailPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const contentType = urlParams.get('type') || 'movie';
    if (!contentId) {
        if (movieDetailHero) movieDetailHero.innerHTML = '<h1>Konten tidak ditemukan.</h1>';
        return;
    }
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
        
        updateMetaTags(finalContent);
        displayHeroDetail(finalContent);
        
        // PERBAIKAN UTAMA: Pastikan elemen ada sebelum diubah
        if (detailMainContent) {
            detailMainContent.innerHTML = '';
            displayTrailer(finalContent.videos.results);
            displayActors(finalContent.credits.cast);
            displayRecommendations(finalContent.recommendations.results, contentType);
        }
    } catch (error) {
        console.error("Error:", error);
        if (movieDetailHero) movieDetailHero.innerHTML = `<h1>Error memuat data. Periksa koneksi atau ID konten.</h1>`;
        if (detailMainContent) detailMainContent.innerHTML = '';
    }
}

// Fungsi untuk Menampilkan Bagian Hero
function displayHeroDetail(content) {
    const title = content.title || content.name;
    const releaseDate = content.release_date || content.first_air_date;
    const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
    const runtimeInfo = content.type === 'tv' ? (content.number_of_seasons ? `${content.number_of_seasons} Seasons` : 'Info N/A') : (content.runtime ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : 'Info N/A');
    const isInWatchlist = getWatchlist().includes(content.id.toString());
    movieDetailHero.innerHTML = `
        <div class="poster-box">
            <img src="${IMG_URL + content.poster_path}" alt="${title}">
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
                <a href="#" class="action-btn play-btn" id="play-btn" data-id="${content.id}" data-type="${content.type}"><i class="fas fa-play"></i> Play</a>
            </div>
        </div>
    `;
    document.getElementById('play-btn').addEventListener('click', handlePlayClick);
    const fakeButtons = document.getElementById('fake-buttons').querySelectorAll('a');
    fakeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            startAdCountdown(() => {}); // Hanya buka iklan, tidak melakukan apa-apa
        });
    });
}

// Fungsi untuk Menangani Klik Tombol Play
function handlePlayClick(e) {
    e.preventDefault();
    const { id, type } = e.currentTarget.dataset;
    let streamUrl;
    if (type === 'tv') { streamUrl = `${STREAMING_URL_TV}${id}/1/1`; } else { streamUrl = `${STREAMING_URL_MOVIE}${id}`; }
    startAdCountdown(() => {
        if (movieIframe) movieIframe.src = streamUrl;
        if (videoModal) videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

// Fungsi untuk Menampilkan Trailer
function displayTrailer(videos) {
    const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube');
    const firstVideo = videos.find(v => v.site === 'YouTube');
    const trailer = officialTrailer || teaser || firstVideo;
    if (trailer) {
        const trailerSection = document.createElement('section');
        trailerSection.className = 'content-section';
        trailerSection.innerHTML = `<h2>Trailer</h2><div id="trailer-container"><iframe src="https://www.youtube.com/embed/${trailer.key}" title="YouTube video player" allowfullscreen></iframe></div>`;
        if (detailMainContent) detailMainContent.appendChild(trailerSection);
    }
}

// Fungsi untuk Menampilkan Aktor
function displayActors(cast) {
    if (!cast || cast.filter(actor => actor.profile_path).length === 0) return;
    const actorsSection = document.createElement('section');
    actorsSection.className = 'content-section';
    let actorsHTML = '';
    cast.filter(actor => actor.profile_path).slice(0, 12).forEach(actor => {
        actorsHTML += `<div class="actor-card"><img src="${IMG_URL + actor.profile_path}" alt="${actor.name}"><h3>${actor.name}</h3><p>${actor.character}</p></div>`;
    });
    actorsSection.innerHTML = `<h2>Pemeran Utama</h2><div class="actors-grid">${actorsHTML}</div>`;
    if (detailMainContent) detailMainContent.appendChild(actorsSection);
}

// Fungsi untuk Menampilkan Rekomendasi
function displayRecommendations(recommendations, type) {
    if (!recommendations || recommendations.length === 0) return;
    const recommendationsSection = document.createElement('section');
    recommendationsSection.className = 'content-section';
    let recHTML = '';
    recommendations.slice(0, 10).forEach(item => {
        if (item.poster_path) {
            recHTML += `<a href="detail.html?id=${item.id}&type=${type}" class="movie-card"><img src="${IMG_URL + item.poster_path}" alt="${item.title || item.name}"><div class="movie-info"><h3>${item.title || item.name}</h3></div></a>`;
        }
    });
    recommendationsSection.innerHTML = `<h2>Rekomendasi Serupa</h2><div class="movie-grid">${recHTML}</div>`;
    if (detailMainContent) detailMainContent.appendChild(recommendationsSection);
}

// Event Listener untuk Menutup Modal
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        if (movieIframe) movieIframe.src = ''; 
        if (videoModal) videoModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
}

// Event Listener Utama
document.addEventListener('DOMContentLoaded', loadDetailPage);
