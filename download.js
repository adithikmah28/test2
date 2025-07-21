const API_KEY = '8c79e8986ea53efac75026e541207aa3'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const CONSUMET_API_URL = PROXY_URL + 'https://consumet-api-beta.vercel.app/movies/flixhq/';

const downloadContentWrapper = document.getElementById('download-content-wrapper');

async function loadDownloadPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) { displayError("ID film tidak ditemukan."); return; }
    try {
        const tmdbResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID`);
        if (!tmdbResponse.ok) throw new Error("Film tidak ditemukan di TMDB.");
        const movie = await tmdbResponse.json();
        document.title = `Download ${movie.title} - CineBro`;
        displayDownloadInfo(movie);
        const infoResponse = await fetch(`${CONSUMET_API_URL}info?id=${movieId}`);
        const infoData = await infoResponse.json();
        const watchResponse = await fetch(`${CONSUMET_API_URL}watch?episodeId=${infoData.episodes[0].id}&mediaId=${movieId}`);
        const watchData = await watchResponse.json();
        if (!watchData.sources || watchData.sources.length === 0) throw new Error("Sumber download tidak ditemukan.");
        displayDownloadButtons(watchData.sources, movie.title);
    } catch (error) { console.error("Error:", error); displayError(error.message); }
}

function displayDownloadInfo(movie) {
    const overview = movie.overview.length > 150 ? movie.overview.substring(0, 150) + '...' : movie.overview;
    const html = `<div class="download-card"><div class="download-header"><div class="download-poster"><img src="${IMG_URL + movie.poster_path}" alt="${movie.title}"></div><div class="download-info"><h1>${movie.title}</h1><p>${overview}</p></div></div><div class="download-buttons" id="download-buttons"><p><i class="fas fa-spinner fa-spin"></i> Mencari link berdasarkan kualitas...</p></div></div>`;
    downloadContentWrapper.innerHTML = html;
}

function displayDownloadButtons(sources, movieTitle) {
    const downloadButtonsContainer = document.getElementById('download-buttons');
    downloadButtonsContainer.innerHTML = '';
    sources.sort((a, b) => parseInt(a.quality) - parseInt(b.quality));
    sources.forEach(source => {
        if (source.quality && source.url) {
            const button = document.createElement('a');
            button.href = source.url;
            button.className = 'download-button-item';
            button.target = '_blank';
            button.download = `${movieTitle} (${source.quality}).mp4`;
            button.innerHTML = `<i class="fas fa-cloud-download-alt"></i> Download (${source.quality})`;
            downloadButtonsContainer.appendChild(button);
        }
    });
    if (downloadButtonsContainer.innerHTML === '') {
        downloadButtonsContainer.innerHTML = '<p>Maaf, tidak ada link download yang valid ditemukan.</p>';
    }
}

function displayError(message) {
    const html = `<div class="download-card"><h2><i class="fas fa-exclamation-triangle"></i> Error</h2><p>${message}</p></div>`;
    downloadContentWrapper.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadDownloadPage);
