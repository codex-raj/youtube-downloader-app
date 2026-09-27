const API_KEY = 'AIzaSyDv3sDDm3kLCTxQB7MmyyGK0nw2A9K0q_k';

const playerPlaceholder = document.getElementById('player-placeholder');
const videoWrapper = document.getElementById('video-wrapper');
const videoEl = document.getElementById('video');
const playerDiv = document.getElementById('player');
const videoTitle = document.getElementById('video-title');
const videoChannel = document.getElementById('video-channel');
const linkInput = document.getElementById('link-input');
const loadBtn = document.getElementById('load-btn');
const downloadBtn = document.getElementById('download-btn');
const videoGrid = document.getElementById('video-grid');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const msgEl = document.getElementById('msg');

// Load YouTube IFrame API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {}

function showMsg(text, isError = false) {
  if (!msgEl) return;
  msgEl.textContent = text;
  msgEl.style.color = isError ? '#ff4d4d' : '#2ecc71';
}

function getYoutubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function searchYoutube(query) {
  showMsg('Searching...');
  console.log('Querying API for:', query); // Debugging line
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${encodeURIComponent(query)}&key=${API_KEY}`;
    console.log('Fetching URL:', url); // Debugging line
    const response = await fetch(url);
    const data = await response.json();
    console.log('API Response:', data); // Debugging line

    if (data.error) {
      showMsg('API Error: ' + data.error.message, true);
    } else if (data.items) {
      renderVideos(data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high.url
      })));
      showMsg('Search results loaded');
    } else {
      showMsg('No results found');
    }
  } catch (err) {
    showMsg('Search failed: ' + err.message, true);
    console.error(err);
  }
}

function renderVideos(videos) {
  videoGrid.innerHTML = '';
  videos.forEach((v) => {
    const card = document.createElement('div');
    card.className = 'video-card';
    card.innerHTML = `
      <div class="thumbnail" style="background-image:url(${v.thumbnail}); background-size:cover; background-position:center;"></div>
      <div class="card-info">
        <h4>${v.title}</h4>
        <p>${v.channel}</p>
      </div>
    `;
    card.addEventListener('click', () => loadYoutubeVideo(v.id, v.title, v.channel));
    videoGrid.appendChild(card);
  });
}

function loadYoutubeVideo(id, title, channel) {
  playerPlaceholder.classList.add('hidden');
  videoWrapper.classList.remove('hidden');
  videoEl.classList.add('hidden');
  playerDiv.classList.remove('hidden');

  playerDiv.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;

  videoTitle.textContent = title;
  videoChannel.textContent = channel;
  linkInput.value = `https://youtube.com/watch?v=${id}`;
  showMsg('▶ Playing: ' + title);
}

function loadFromLink() {
  const url = linkInput.value.trim();
  const ytId = getYoutubeId(url);
  if (ytId) {
    loadYoutubeVideo(ytId, 'YouTube Video', 'YouTube');
  } else {
    showMsg('Invalid YouTube link', true);
  }
}

function downloadVideo() {
  const url = linkInput.value.trim();
  if (!url) {
    showMsg('Paste a valid YouTube link first', true);
    return;
  }
  showMsg('Downloading... check your terminal for progress');
  fetch(`/download?url=${encodeURIComponent(url)}`)
    .then(res => res.text())
    .then(msg => showMsg(msg))
    .catch(err => showMsg('Error: Backend unreachable', true));
}

const sidebar = document.querySelector('.sidebar');
const menuBtn = document.getElementById('menu-btn');

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
});

const sidebarItems = document.querySelectorAll('.sidebar-item');
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    sidebarItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    const query = item.textContent.replace(/[^\w\s]/g, '').trim();
    searchYoutube(query);
  });
});

loadBtn.addEventListener('click', loadFromLink);
downloadBtn.addEventListener('click', downloadVideo);
searchBtn.addEventListener('click', () => searchYoutube(searchInput.value));
searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') searchYoutube(searchInput.value); });

searchYoutube('javascript tutorial');
