const API_KEY = '8c79e8986ea53efac75026e541207aa3'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
// Sumber link download, TV series mungkin tidak selalu ada di sini
const DOWNLOAD_SOURCE_URL_MOVIE = 'https://dl.vidsrc.vip/movie/';
const DOWNLOAD_SOURCE_URL_TV = 'https://dl.vidsrc.vip/tv/'; 

const downloadContentWrapper = document.getElementById('download-content-wrapper');

async function loadDownloadPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('id');
    const contentType = urlParams.get('type') || 'movie'; // Ambil tipe dari URL

    if (!contentId) { /* ... (sama) */ return; }

    try {
        const endpoint = `/${contentType}/${contentId}`;
        const response = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}&language=id-ID`);
        if (!response.ok) throw new Error("Konten tidak ditemukan di TMDB.");
        
        const content = await response.json();
        const title = content.title || content.name;
        document.title = `Download ${title} - CineBro`;
        displayDownloadInfo(content, contentType);

    } catch (error) { /* ... (sama) */ }
}

function displayDownloadInfo(content, type) {
    const downloadLink = type === 'tv' 
        ? `${DOWNLOAD_SOURCE_URL_TV}${content.id}` 
        : `${DOWNLOAD_SOURCE_URL_MOVIE}${content.id}`;
    
    const title = content.title || content.name;
    // ... (sisa logika sama, gunakan variabel title)
    
    // Tombol download untuk TV mungkin tidak berfungsi per episode, jadi kita beri catatan
    const downloadButtonText = type === 'tv' ? 'Download Seluruh Season (ZIP)' : 'Download Film';
    
    const html = `... (Gunakan variabel downloadLink dan downloadButtonText di sini) ...`;
    downloadContentWrapper.innerHTML = html;
}

// ... (sisa fungsi sama)
document.addEventListener('DOMContentLoaded', loadDownloadPage);
