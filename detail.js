const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
// Menggunakan Proxy untuk menghindari masalah CORS saat dijalankan lokal
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const CONSUMET_API_URL = PROXY_URL + 'https://consumet-api-beta.vercel.app/movies/flixhq/';

const movieDetailHero = document.getElementById('movie-detail-hero');
const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const videoElement = document.getElementById('player');
let player;

function getWatchlist() { return JSON.parse(localStorage.getItem('cinebroWatchlist')) || []; }
function saveWatchlist(watchlist) { localStorage.setItem('cinebroWatchlist', JSON.stringify(watchlist)); }

async function loadMovieDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) { movieDetailHero.innerHTML = '<h1>Film tidak ditemukan.</h1>'; return; }

    try {
        const [indonesianData, englishData] = await Promise.all([
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID&append_to_response=videos,credits,recommendations`),
            fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US&append_to_response=videos`)
        ]);
        if (!indonesianData.ok) throw new Error('Film tidak ditemukan.');
        const movie = await indonesianData.json();
        const movieEnglish = await englishData.json();
        const finalMovieData = { ...movie, overview: movie.overview || movieEnglish.overview || "Maaf, sinopsis untuk film ini belum tersedia.", videos: { results: movie.videos.results.length > 0 ? movie.videos.results : movieEnglish.videos.results } };
        
        displayHeroDetail(finalMovieData);
        displayTrailer(finalMovieData.videos.results);
        displayActors(finalMovieData.credits.cast);
        displayRecommendations(finalMovieData.recommendations.results);
    } catch (error) { console.error('Error fetching movie details:', error); movieDetailHero.innerHTML = `<h1>Error: ${error.message}</h1>`; }
}

function displayHeroDetail(movie) {
    movieDetailHero.style.backgroundImage = `url(${BACKDROP_URL + movie.backdrop_path})`;
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }) : 'N/A';
    const duration = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
    const genresHTML = movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('');
    const isInWatchlist = getWatchlist().includes(movie.id.toString());
    movieDetailHero.innerHTML = `<div class="poster-box"><img src="${IMG_URL + movie.poster_path}" alt="${movie.title}"></div><div class="detail-box"><h1>${movie.title}</h1><div class="meta-info"><span><i class="fas fa-calendar-alt"></i> ${releaseDate}</span><span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span><span><i class="fas fa-clock"></i> ${duration}</span></div><div class="genres">${genresHTML}</div><p class="overview">${movie.overview}</p><div class="action-buttons"><a href="#" class="action-btn play-btn" id="play-movie-btn" data-movie-id="${movie.id}"><i class="fas fa-play"></i> Play</a><a href="#" class="action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" id="watchlist-btn" data-movie-id="${movie.id}"><i class="fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i> ${isInWatchlist ? 'In Watchlist' : 'Add to watchlist'}</a><a href="#" class="action-btn download-btn" id="download-btn" data-movie-id="${movie.id}" data-movie-title="${movie.title}"><i class="fas fa-download"></i></a></div></div>`;
    document.getElementById('play-movie-btn').addEventListener('click', handlePlayClick);
    document.getElementById('watchlist-btn').addEventListener('click', handleWatchlistClick);
    document.getElementById('download-btn').addEventListener('click', handleDownloadClick);
}

async function handlePlayClick(e) {
    e.preventDefault();
    const movieId = e.currentTarget.dataset.movieId;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    videoElement.poster = 'https://via.placeholder.com/1280x720/000000/FFFFFF?text=Mencari+sumber+video...';
    if(player) player.destroy();
    
    try {
        const infoResponse = await fetch(`${CONSUMET_API_URL}info?id=${movieId}`);
        const infoData = await infoResponse.json();
        const watchResponse = await fetch(`${CONSUMET_API_URL}watch?episodeId=${infoData.episodes[0].id}&mediaId=${movieId}`);
        const watchData = await watchResponse.json();
        if (!watchData.sources || watchData.sources.length === 0) throw new Error("Sumber video tidak ditemukan.");
        
        const sources = watchData.sources.map(s => ({ src: s.url, type: 'application/x-mpegURL', size: parseInt(s.quality) }));
        const tracks = watchData.subtitles.map(s => ({ kind: 'captions', label: s.lang, src: s.url, default: s.lang.toLowerCase().includes('indonesian') }));
        initializePlayer(sources, tracks);
    } catch (error) { console.error("Error memuat video:", error); videoElement.poster = 'https://via.placeholder.com/1280x720/000000/FF0000?text=Gagal+memuat+video.+Coba+lagi.'; }
}

function initializePlayer(sources, tracks) {
    const defaultQuality = sources.some(s => s.size === 720) ? 720 : Math.max(...sources.map(s => s.size).filter(s => s));
    const options = { captions: { active: true, update: true, language: 'auto' }, quality: { default: defaultQuality, options: sources.map(s => s.size) } };
    if (Hls.isSupported()) {
        const hls = new Hls({ capLevelToPlayerSize: true, maxBufferSize: 60 * 1000 * 1000 });
        hls.loadSource(sources.find(s => s.size === defaultQuality)?.src || sources[0].src);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            player = new Plyr(videoElement, options);
            player.source = { type: 'video', sources: [], tracks: tracks }; hls.attachMedia(videoElement); window.hls = hls; player.play();
        });
    } else { player = new Plyr(videoElement, options); player.source = { type: 'video', sources: sources, tracks: tracks }; player.play(); }
}

async function handleDownloadClick(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const movieId = button.dataset.movieId;
    button.classList.add('loading'); button.disabled = true;

    try {
        const infoResponse = await fetch(`${CONSUMET_API_URL}info?id=${movieId}`);
        const infoData = await infoResponse.json();
        const watchResponse = await fetch(`${CONSUMET_API_URL}watch?episodeId=${infoData.episodes[0].id}&mediaId=${movieId}`);
        const watchData = await watchResponse.json();
        if (!watchData.sources || watchData.sources.length === 0) throw new Error("Sumber download tidak ditemukan.");
        
        const bestQualitySource = watchData.sources[watchData.sources.length - 1];
        alert(`Siap untuk mendownload! \n\nBrowser akan membuka tab baru untuk memulai download. Jika tidak dimulai otomatis, gunakan menu "Save As" (Ctrl+S) di tab baru tersebut.`);
        window.open(bestQualitySource.url, '_blank');
    } catch (error) { console.error("Gagal mendapatkan link download:", error); alert("Maaf, gagal mendapatkan link download untuk film ini.");
    } finally { button.classList.remove('loading'); button.disabled = false; }
}

function handleWatchlistClick(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const movieId = button.dataset.movieId;
    let watchlist = getWatchlist();
    if (watchlist.includes(movieId)) { watchlist = watchlist.filter(id => id !== movieId); button.classList.remove('active'); button.innerHTML = `<i class="fas fa-plus"></i> Add to watchlist`;
    } else { watchlist.push(movieId); button.classList.add('active'); button.innerHTML = `<i class="fas fa-check"></i> In Watchlist`; }
    saveWatchlist(watchlist);
}

function displayTrailer(videos) {
    const trailerContainer = document.getElementById('trailer-container');
    const trailer = videos.find(v => (v.type === 'Trailer' || v.type === 'Teaser') && v.site === 'YouTube');
    if (trailerContainer) trailerContainer.innerHTML = trailer ? `<iframe src="https://www.youtube.com/embed/${trailer.key}" title="YouTube video player" allowfullscreen></iframe>` : `<div class="trailer-placeholder"><p>Trailer resmi belum tersedia.</p></div>`;
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

function displayRecommendations(movies) {
    const recommendationsGrid = document.getElementById('recommendations-grid');
    if (!recommendationsGrid) return;
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

closeModalBtn.addEventListener('click', () => {
    if (player) player.destroy();
    if (window.hls) window.hls.destroy();
    videoElement.removeAttribute('src');
    videoElement.poster = '';
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

document.addEventListener('DOMContentLoaded', loadMovieDetail);
