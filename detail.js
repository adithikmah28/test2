const API_KEY = '8c79e8986ea53efac75026e541207aa3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';
// URL SUMBER BARU
const STREAMING_URL = 'https://vidfast.pro/movie/';
const DOWNLOAD_URL = 'https://dl.vidsrc.vip/movie/';

const movieDetailHero = document.getElementById('movie-detail-hero');
const videoModal = document.getElementById('video-modal');
const closeModalBtn = document.getElementById('close-video-modal');
const movieIframe = document.getElementById('movie-iframe');

function getWatchlist() { return JSON.parse(localStorage.getItem('cinebroWatchlist')) || []; }
function saveWatchlist(watchlist) { localStorage.setItem('cinebroWatchlist', JSON.stringify(watchlist)); }

async function loadMovieDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) { movieDetailHero.innerHTML = '<h1>Film tidak ditemukan.</h1>'; return; }

    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID&append_to_response=videos,credits,recommendations`);
        if (!response.ok) throw new Error('Film tidak ditemukan.');
        const movie = await response.json();
        if (!movie.overview) {
            const englishResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`);
            const englishMovie = await englishResponse.json();
            movie.overview = englishMovie.overview || "Maaf, sinopsis untuk film ini belum tersedia.";
        }
        
        displayHeroDetail(movie);
        displayTrailer(movie.videos.results);
        displayActors(movie.credits.cast);
        displayRecommendations(movie.recommendations.results);
    } catch (error) { console.error('Error fetching movie details:', error); movieDetailHero.innerHTML = `<h1>Error: ${error.message}</h1>`; }
}

function displayHeroDetail(movie) {
    movieDetailHero.style.backgroundImage = `url(${BACKDROP_URL + movie.backdrop_path})`;
    const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' }) : 'N/A';
    const duration = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'N/A';
    const genresHTML = movie.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('');
    const isInWatchlist = getWatchlist().includes(movie.id.toString());
    movieDetailHero.innerHTML = `<div class="poster-box"><img src="${IMG_URL + movie.poster_path}" alt="${movie.title}"></div><div class="detail-box"><h1>${movie.title}</h1><div class="meta-info"><span><i class="fas fa-calendar-alt"></i> ${releaseDate}</span><span><i class="fas fa-star"></i> ${movie.vote_average.toFixed(1)}</span><span><i class="fas fa-clock"></i> ${duration}</span></div><div class="genres">${genresHTML}</div><p class="overview">${movie.overview}</p><div class="action-buttons"><a href="#" class="action-btn play-btn" id="play-movie-btn" data-movie-id="${movie.id}"><i class="fas fa-play"></i> Play</a><a href="#" class="action-btn watchlist-btn ${isInWatchlist ? 'active' : ''}" id="watchlist-btn" data-movie-id="${movie.id}"><i class="fas ${isInWatchlist ? 'fa-check' : 'fa-plus'}"></i> ${isInWatchlist ? 'In Watchlist' : 'Add to watchlist'}</a><a href="#" class="action-btn download-btn" id="download-btn" data-movie-id="${movie.id}"><i class="fas fa-download"></i></a></div></div>`;
    
    document.getElementById('play-movie-btn').addEventListener('click', handlePlayClick);
    document.getElementById('watchlist-btn').addEventListener('click', handleWatchlistClick);
    document.getElementById('download-btn').addEventListener('click', handleDownloadClick);
}

function handlePlayClick(e) {
    e.preventDefault();
    const movieId = e.currentTarget.dataset.movieId;
    movieIframe.src = STREAMING_URL + movieId;
    videoModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function handleDownloadClick(e) {
    e.preventDefault();
    const movieId = e.currentTarget.dataset.movieId;
    const downloadLink = DOWNLOAD_URL + movieId;
    window.open(downloadLink, '_blank');
}

function handleWatchlistClick(e) {
    e.preventDefault();
    const button = e.currentTarget;
    const movieId = button.dataset.movieId;
    let watchlist = getWatchlist();
    if (watchlist.includes(movieId)) {
        watchlist = watchlist.filter(id => id !== movieId);
        button.classList.remove('active');
        button.innerHTML = `<i class="fas fa-plus"></i> Add to watchlist`;
    } else {
        watchlist.push(movieId);
        button.classList.add('active');
        button.innerHTML = `<i class="fas fa-check"></i> In Watchlist`;
    }
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
    movieIframe.src = ''; // Hentikan video dengan mengosongkan src
    videoModal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

document.addEventListener('DOMContentLoaded', loadMovieDetail);
