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
const trailerSection = document.getElementById('trailer-section');
const actorsSection = document.getElementById('actors-section');
const recommendationsSection = document.getElementById('recommendations-section');
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
function getWatchlist() { return JSON.parse(localStorage.getItem('cinebroWatchlist')) || []; }
function saveWatchlist(watchlist) { localStorage.setItem('cinebroWatchlist', JSON.stringify(watchlist)); }
function updateMetaTags(content) { /* ... (fungsi ini sama) ... */ }

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
        updateMetaTags(finalContent);
        displayHeroDetail(finalContent);
        displayTrailer(finalContent.videos.results);
        displayActors(finalContent.credits.cast);
        displayRecommendations(finalContent.recommendations.results, contentType);
    } catch (error) {
        console.error("Error:", error);
        movieDetailHero.innerHTML = `<h1>Error memuat data. Periksa koneksi atau ID konten.</h1>`;
    }
}

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
            startAdCountdown(() => {});
        });
    });
}

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

function displayTrailer(videos) {
    if (!trailerSection) return;
    const officialTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const teaser = videos.find(v => v.type === 'Teaser' && v.site === 'YouTube');
    const firstVideo = videos.find(v => v.site === 'YouTube');
    const trailer = officialTrailer || teaser || firstVideo;
    if (trailer) {
        trailerSection.style.display = 'block';
        const trailerContainer = document.getElementById('trailer-container');
        if (trailerContainer) trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailer.key}" title="YouTube video player" allowfullscreen></iframe>`;
    } else {
        trailerSection.style.display = 'none';
    }
}

function displayActors(cast) {
    if (!actorsSection || !cast || cast.filter(actor => actor.profile_path).length === 0) {
        if (actorsSection) actorsSection.style.display = 'none';
        return;
    }
    actorsSection.style.display = 'block';
    const actorsGrid = document.getElementById('actors-grid');
    if (!actorsGrid) return;
    actorsGrid.innerHTML = '';
    cast.filter(actor => actor.profile_path).slice(0, 12).forEach(actor => {
        const actorCard = document.createElement('div');
        actorCard.classList.add('actor-card');
        actorCard.innerHTML = `<img src="${IMG_URL + actor.profile_path}" alt="${actor.name}"><h3>${actor.name}</h3><p>${actor.character}</p>`;
        actorsGrid.appendChild(actorCard);
    });
}

function displayRecommendations(recommendations, type) {
    if (!recommendationsSection || !recommendations || recommendations.length === 0) {
        if (recommendationsSection) recommendationsSection.style.display = 'none';
        return;
    }
    recommendationsSection.style.display = 'block';
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

closeModalBtn.addEventListener('click', () => { /* ... (fungsi ini sama) ... */ });
document.addEventListener('DOMContentLoaded', loadDetailPage);
