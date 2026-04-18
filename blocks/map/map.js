/**
 * Decorates the map block by embedding a map centered on the user's current location.
 * @param {Element} block The map block element
 */
export default async function decorate(block) {
  const mapContainer = document.createElement('div');
  mapContainer.className = 'user-location-map';
  mapContainer.style.width = '100%';
  mapContainer.style.height = '400px';
  mapContainer.style.marginTop = '1rem';
  function createMapIframe(lat, lon, type = 'mapnik') {
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = '0';
    const bbox = `${lon - 0.01}%2C${lat - 0.01}%2C${lon + 0.01}%2C${lat + 0.01}`;
    const marker = `${lat}%2C${lon}`;
    let src = type === 'satellite'
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=EsriWorldImagery&marker=${marker}`
      : `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
    iframe.src = src;
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    return iframe;
  }
  function createToggleIcon(type) {
    const btn = document.createElement('button');
    btn.className = 'map-toggle-btn';
    Object.assign(btn.style, {
      position: 'absolute', top: '16px', right: '16px', zIndex: '10',
      background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
      width: '40px', height: '40px', display: 'flex', alignItems: 'center',
      justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      cursor: 'pointer'
    });
    btn.title = type === 'satellite' ? 'Switch to Satellite View' : 'Switch to Map View';
    btn.innerHTML = type === 'satellite'
      ? `<svg width="24" height="24" fill="none" stroke="#333" stroke-width="2" 
      stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`
      : `<svg width="24" height="24" fill="none" stroke="#333" stroke-width="2" 
      stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2v20"/></svg>`;
    return btn;
  }
  function removeToggleBtn() {
    const prevBtn = mapContainer.querySelector('.map-toggle-btn');
    if (prevBtn) prevBtn.remove();
  }
  let currentLat = 20.5937, currentLon = 78.9629, currentType = 'mapnik';
  function renderMap() {
    mapContainer.innerHTML = '';
    mapContainer.style.position = 'relative';
    mapContainer.appendChild(createMapIframe(currentLat, currentLon, currentType));
    removeToggleBtn();
    const toggleBtn = createToggleIcon(currentType === 'mapnik' ? 'satellite' : 'mapnik');
    toggleBtn.onclick = () => {
      currentType = currentType === 'mapnik' ? 'satellite' : 'mapnik';
      renderMap();
    };
    mapContainer.appendChild(toggleBtn);
  }
  renderMap();
  block.appendChild(mapContainer);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        currentLat = pos.coords.latitude;
        currentLon = pos.coords.longitude;
        renderMap();
      },
      () => {
        const msg = document.createElement('div');
        msg.textContent = 'Unable to retrieve your location. Showing default map.';
        msg.style.marginTop = '0.5rem';
        mapContainer.appendChild(msg);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  } else {
    const msg = document.createElement('div');
    msg.textContent = 'Geolocation is not supported by your browser. Showing default map.';
    msg.style.marginTop = '0.5rem';
    mapContainer.appendChild(msg);
  }
}