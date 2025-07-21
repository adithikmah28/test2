const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
const STREAMING_URL_MOVIE = 'https://vidfast.pro/movie/';
const STREAMING_URL_TV = 'https://vidfast.pro/tv/';

const ADSTERRA_DIRECT_LINK = 'GANTI_DENGAN_DIRECT_LINK_ADSTERRA_ANDA';
const COUNTDOWN_SECONDS = 3;

const movieDetailHero = document.getElementById('movie-detail-hero');
const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const movieIframe = document.getElementById('movie-iframe');
const adTimerModal = document.getElementById('ad-timer-modal');
const adTimerCountdown = document.getElementById('ad-timer-countdown');
const adTimerContinueBtn = document.getElementById('ad-timer-continue-btn');
const trailerSection = document.getElementById('trailer-section');
const seasonsSection = document.getElementById('seasons-section');
const seasonSelect = document.getElementById('season-select');
const episodesGrid = document.getElementById('episodes-grid');

let currentContent;
let countdownInterval;
let onContinueAction;

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

adTimerContinueBtn.addEventListener('click', () => {
    adTimerModal.style.display = 'none';
    clearInterval(countdownInterval);
    if (typeof onContinueAction === 'function') { onContinueAction(); }
});

function getWatchlist() { return JSON.parse(localStorage.getItem('cinebroWatchlist')) || []; }
function saveWatchlist(watchlist) { localStorage.setItem('cinebroWatchlist', JSON.stringify(watchlist)); }

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
        data.videos = { results: data.videos?.results.length > 0 ? data.videos.results : englishDataJson.videos.results };
        currentContent = { ...data, type: contentType };
        document.title = `${data.title || data.name} - CineBro`;
        displayHeroDetail(currentContent);
        displayActors(currentContent.credits.cast);
        displayRecommendations(currentContent.recommendations.results, contentType);
        if (contentType === 'tv') {
            trailerSection.style.display = 'none'; seasonsSection.style.display = 'block';
            displaySeasons(currentContent.seasons);
        } else {
            seasonsSection.style.display = 'none'; trailerSection.style.display = 'block';
            displayTrailer(currentContent.videos.results);
        }
    } catch (error) { console.error("Error:", error); movieDetailHero.innerHTML = `<h1>Error memuat data.</h1>`; }
}

function displayHeroDetail(content) {
    const title = content.title || content.name;
    const releaseDate = content.release_date || content.first_air_date;
    const formattedDate = releaseDate ? new Date(releaseDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';
    const runtimeInfo = content.type === 'tv' ? `${content.number_of_seasons} Seasons` : (content.runtime ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : 'N/A');
    const isInWatchlist = getWatchlist().includes(content.id.toString());
    const playButtonHTML = content.type === 'movie' ? `<a href="#" class="action-btn play-btn" id="play-movie-btn" data-movie-id="${content.id}"><i class="fas fa-play"></i> Play</a>` : '';
    movieDetailHero.innerHTML = `<div class="poster-box"><img src="${IMG_URL + content.poster_path}" alt="${title}"></div><div class="detail-box"><h1>${title}</h1><div class="meta-info"><span><i class="fas fa-calendar-alt"></i> ${formattedDate}</span><span><i class="fas fa-star"></i> ${content.vote_average.toFixed(1)}</span><span><i class="fas fa-clock"></i> ${runtimeInfo}</span></div><div class="genres">${content.genres.map(g => `<span class="genre-tag">${g.name}</span>`).join('')}</div><p class="overview">${content.overview}</p><div class="action-buttons">${playButtonHTML}<a href="#" class="action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" id="watchlist-btn" data-content-id="${content.id}"><i class="fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i> ${isInWatchlist ? 'In Watchlist' : 'Add to watchlist'}</a><a href="download.html?id=${content.id}&type=${content.type}" class="action-btn download-btn"><i class="fas fa-download"></i></a></div></div>`;
    if (content.type === 'movie') { document.getElementById('play-movie-btn').addEventListener('click', handlePlayClick); }
    document.getElementById('watchlist-btn').addEventListener('click', handleWatchlistClick);
}

function displaySeasons(seasons) {
    seasonSelect.innerHTML = '';
    seasons.forEach(season => {
        if (season.season_number > 0) {
            const option = document.createElement('option');
            option.value = season.season_number;
            option.textContent = season.name;
            seasonSelect.appendChild(option);
        }
    });
    displayEpisodesForSeason(seasonSelect.value);
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
        episodeBtn.innerHTML = `E${episode.episode_number}<span>${episode.name}</span>`;
        episodeBtn.addEventListener('click', handleEpisodeClick);
        episodesGrid.appendChild(episodeBtn);
    });
}

function handleEpisodeClick(e) {
    const btn = e.currentTarget;
    const { tvId, season, episode } = btn.dataset;
    const streamUrl = `${STREAMING_URL_TV}${tvId}/${season}/${episode}`;
    startAdCountdown(() => {
        movieIframe.src = streamUrl;
        videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

function handlePlayClick(e) {
    e.preventDefault();
    const movieId = e.currentTarget.dataset.movieId;
    startAdCountdown(() => {
        movieIframe.src = STREAMING_URL_MOVIE + movieId;
        videoModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
}

function handleWatchlistClick(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const contentId = button.dataset.contentId;
    let watchlist = getWatchlist();
    if (watchlist.includes(contentId)) { watchlist = watchlist.filter(id => id !== contentId); button.classList.remove('active'); button.innerHTML = `<i class="fas fa-plus"></i> Add to watchlist`;
    } else { watchlist.push(contentId); button.classList.add('active'); button.innerHTML = `<i class="fas fa-check"></i> In Watchlist`; }
    saveWatchlist(watchlist);
}

function displayTrailer(videos) { /* ... (fungsi ini sama) ... */ }
function displayActors(cast) { /* ... (fungsi ini sama) ... */ }
function displayRecommendations(movies, type) {
    const recGrid = document.getElementById('recommendations-grid');
    recGrid.innerHTML = '';
    movies.slice(0, 10).forEach(item => {
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

closeModalBtn.addEventListener('click', () => {
    movieIframe.src = ''; 
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

document.addEventListener('DOMContentLoaded', loadDetailPage);
