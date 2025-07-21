const API_KEY = '8c79e8986ea53efac75026e541207aa3'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const DOWNLOAD_SOURCE_URL = 'https://dl.vidsrc.vip/movie/'; // <<< KEMBALI KE SUMBER INI

const downloadContentWrapper = document.getElementById('download-content-wrapper');

async function loadDownloadPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    if (!movieId) { displayError("ID film tidak ditemukan."); return; }
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=id-ID`);
        if (!response.ok) throw new Error("Film tidak ditemukan di TMDB.");
        const movie = await response.json();
        document.title = `Download ${movie.title} - CineBro`;
        displayDownloadInfo(movie);
    } catch (error) { console.error("Error:", error); displayError(error.message); }
}

function displayDownloadInfo(movie) {
    const downloadLink = DOWNLOAD_SOURCE_URL + movie.id;
    const overview = movie.overview.length > 150 ? movie.overview.substring(0, 150) + '...' : movie.overview;
    const html = `<div class="download-card"><div class="download-header"><div class="download-poster"><img src="${IMG_URL + movie.poster_path}" alt="${movie.title}"></div><div class="download-info"><h1>${movie.title}</h1><p>${overview}</p></div></div><div class="download-buttons"><a href="${downloadLink}" class="download-button-item" target="_blank"><i class="fas fa-cloud-download-alt"></i> Download Film</a></div></div>`;
    downloadContentWrapper.innerHTML = html;
}

function displayError(message) {
    const html = `<div class="download-card"><h2><i class="fas fa-exclamation-triangle"></i> Error</h2><p>${message}</p></div>`;
    downloadContentWrapper.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadDownloadPage);
