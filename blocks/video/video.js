// Decorate function for the video block
export default function decorate(block) {
  const link = block.querySelector('a');
  if (!link) return block.innerHTML = '';
  const urlText = link.textContent.trim();
  let videoId = '', isYouTube = false, isDirectVideo = false, videoType = '', embedUrl = '';
  try {
    const url = new URL(urlText);
    if (url.hostname.includes('youtu.be')) videoId = url.pathname.slice(1).split('/')[0], isYouTube = true, embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&mute=1&enablejsapi=1`;
    else if (url.hostname.includes('youtube.com')) {
      videoId = url.searchParams.get('v') || (url.pathname.startsWith('/embed/') && url.pathname.split('/embed/')[1]);
      if (videoId) isYouTube = true, embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&mute=1&enablejsapi=1`;
    } else if (url.pathname.match(/\.(mp4|webm|ogg)$/i)) isDirectVideo = true, videoType = url.pathname.split('.').pop(), embedUrl = urlText;
  } catch (e) { return block.innerHTML = ''; }
  block.innerHTML = '';
  if (!isYouTube && !isDirectVideo) return;
  const fullscreenWrapper = Object.assign(document.createElement('div'), { className: 'video-fullscreen-wrapper', style: 'position:relative;width:100vw;height:100vh;overflow:hidden;' });
  let videoElem, playPauseBtn, isPlaying = true, player;
  const btnStyle = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2;font-size:3rem;background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:64px;height:64px;display:flex;align-items:center;justify-content:center;cursor:pointer;';
  if (isYouTube) {
    const iframe = Object.assign(document.createElement('iframe'), { id: `video-iframe-${Math.random().toString(36).substr(2,9)}`, src: embedUrl, frameborder: '0', allow: 'autoplay; fullscreen', allowfullscreen: '', className: 'video-iframe', style: 'width:100%;height:100%;position:absolute;top:0;left:0;' });
    fullscreenWrapper.appendChild(iframe);
    playPauseBtn = Object.assign(document.createElement('button'), { className: 'video-play-pause', innerHTML: '⏸️', style: btnStyle });
    fullscreenWrapper.appendChild(playPauseBtn);
    function createPlayer() { player = new window.YT.Player(iframe.id, { events: { 'onReady': () => {} } }); }
    function loadYouTubeAPI() {
      if (window.YT && window.YT.Player) createPlayer();
      else {
        window.onYouTubeIframeAPIReady = createPlayer;
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) document.body.appendChild(Object.assign(document.createElement('script'), { src: 'https://www.youtube.com/iframe_api' }));
      }
    }
    loadYouTubeAPI();
    playPauseBtn.addEventListener('click', () => { if (!player) return; isPlaying ? (player.pauseVideo(), playPauseBtn.innerHTML = '▶️') : (player.playVideo(), playPauseBtn.innerHTML = '⏸️'); isPlaying = !isPlaying; });
  } else if (isDirectVideo) {
    videoElem = Object.assign(document.createElement('video'), { src: embedUrl, type: `video/${videoType}`, controls: true, autoplay: true, playsinline: true, style: 'width:100%;height:100%;position:absolute;top:0;left:0;' });
    fullscreenWrapper.appendChild(videoElem);
    playPauseBtn = Object.assign(document.createElement('button'), { className: 'video-play-pause', innerHTML: '⏸️', style: btnStyle });
    fullscreenWrapper.appendChild(playPauseBtn);
    playPauseBtn.addEventListener('click', () => { videoElem.paused ? (videoElem.play(), playPauseBtn.innerHTML = '⏸️', isPlaying = true) : (videoElem.pause(), playPauseBtn.innerHTML = '▶️', isPlaying = false); });
  }
  (block.closest('.section') || block).appendChild(fullscreenWrapper);
}
