// TourPilot v2.5: Direktsprung + automatische Stockwerk-Intro-Slide
const TOURPILOT_V2_5_ASSET = '20260623-v2-5-1';

function floorLabelV25(floor) {
  const key = String(floor ?? '').trim().toUpperCase();
  if (!key) return 'ohne Geschoss';
  if (key === '0' || key === 'EG') return 'EG';
  if (key === 'UG1' || key === 'UG2') return key;
  return `${key}. Stock`;
}

function stationNameV25(station, index) {
  const order = station?.order ?? index + 1;
  const name = String(station?.station || station?.topic || 'Station').split('\n')[0].trim();
  return `${order} · ${name}`;
}

function floorKeyV25(floor) {
  return String(floor ?? '').trim().toUpperCase();
}

function getFloorIntroDataV25(floor) {
  const key = floorKeyV25(floor);
  const floorStations = (state.stations || []).filter(station => floorKeyV25(station.floor) === key);
  const specialSource = floorStations.find(station => String(station.special || '').trim());
  const firstStation = floorStations[0] || {};
  return {
    key,
    label: floorLabelV25(floor),
    special: String(specialSource?.special || '').trim(),
    firstStation,
    map: typeof getMap === 'function' ? getMap(floor) : null
  };
}

function openStationJumpV25() {
  const overlay = document.createElement('div');
  overlay.className = 'jumpOverlay';
  const groups = new Map();
  (state.stations || []).forEach((station, index) => {
    const key = floorKeyV25(station.floor);
    const label = floorLabelV25(station.floor);
    if (!groups.has(key)) groups.set(key, { label, items: [] });
    groups.get(key).items.push({ station, index });
  });
  overlay.innerHTML = `
    <div class="jumpSheet">
      <div class="jumpHeader">
        <div><h2>Station wechseln</h2><p>Direkt zur gewünschten Station springen.</p></div>
        <button class="mapIconBtn" id="closeJump">×</button>
      </div>
      <div class="jumpList">
        ${[...groups.values()].map(group => `
          <section class="jumpGroup">
            <h3>${esc(group.label)}</h3>
            ${group.items.map(({ station, index }) => `<button class="jumpItem ${index === state.i ? 'active' : ''}" data-jump-index="${index}"><span>${esc(stationNameV25(station, index))}</span><small>${esc(String(station.way || station.access || '').slice(0, 70))}</small></button>`).join('')}
          </section>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.querySelector('#closeJump').onclick = close;
  overlay.onclick = event => { if (event.target === overlay) close(); };
  overlay.querySelectorAll('[data-jump-index]').forEach(button => {
    button.onclick = () => {
      state.i = Number(button.dataset.jumpIndex || 0);
      state.view = 'tour';
      close();
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
  });
}

function showFloorIntroV25(targetIndex) {
  const station = state.stations[targetIndex] || {};
  const data = getFloorIntroDataV25(station.floor);
  const overlay = document.createElement('div');
  overlay.className = 'floorIntroOverlay';
  const mapHtml = data.map ? `<div class="floorIntroMap"><img src="${esc(data.map.src)}?v=${TOURPILOT_V2_5_ASSET}" alt="${esc(data.map.title)}"><button id="openIntroMap" class="btn ghost">▧ Karte gross öffnen</button></div>` : '';
  overlay.innerHTML = `
    <div class="floorIntroSheet">
      <div class="floorIntroTop">
        <div class="floorBadge">${esc(data.label)}</div>
        <button class="mapIconBtn" id="closeIntro">×</button>
      </div>
      <h2>Willkommen im ${esc(data.label)}</h2>
      ${data.special ? `<article class="card creme funfact"><div class="sectionTitle">😊 Themenwelt & Fun-Fact</div>${paragraphsV2(data.special)}</article>` : `<article class="card creme"><div class="sectionTitle">😊 Themenwelt & Fun-Fact</div><p class="small">Noch keine Themenwelt für dieses Geschoss hinterlegt.</p></article>`}
      ${mapHtml}
      <button id="continueIntro" class="btn primary">Weiter zu ${esc(stationNameV25(station, targetIndex))}</button>
    </div>`;
  document.body.appendChild(overlay);
  const closeAndContinue = () => {
    overlay.remove();
    state.i = targetIndex;
    state.view = 'tour';
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };
  overlay.querySelector('#continueIntro').onclick = closeAndContinue;
  overlay.querySelector('#closeIntro').onclick = closeAndContinue;
  overlay.onclick = event => { if (event.target === overlay) closeAndContinue(); };
  const mapButton = overlay.querySelector('#openIntroMap');
  if (mapButton && data.map) mapButton.onclick = () => showMap(data.map);
}

function goToStationV25(targetIndex, direction) {
  if (targetIndex < 0 || targetIndex >= state.stations.length) return;
  const currentFloor = floorKeyV25(state.stations[state.i]?.floor);
  const targetFloor = floorKeyV25(state.stations[targetIndex]?.floor);
  const hasNewFloor = targetFloor && targetFloor !== currentFloor && direction === 'forward';
  if (hasNewFloor) showFloorIntroV25(targetIndex);
  else {
    state.i = targetIndex;
    state.view = 'tour';
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}

function enhanceTourNavigationV25() {
  if (state.view !== 'tour') return;
  const progressCard = screen.querySelector('.grid > .card:first-child');
  if (progressCard && !progressCard.querySelector('#jumpStation')) {
    const button = document.createElement('button');
    button.id = 'jumpStation';
    button.className = 'btn ghost jumpStationBtn';
    button.textContent = 'Station wechseln';
    button.onclick = openStationJumpV25;
    progressCard.appendChild(button);
  }
  const next = document.getElementById('next');
  const prev = document.getElementById('prev');
  if (next && !next.dataset.v25) {
    next.dataset.v25 = '1';
    next.onclick = () => {
      if (state.i < state.stations.length - 1) goToStationV25(state.i + 1, 'forward');
      else { state.view = 'finish'; render(); window.scrollTo({ top: 0, behavior: 'auto' }); }
    };
  }
  if (prev && !prev.dataset.v25) {
    prev.dataset.v25 = '1';
    prev.onclick = () => { if (state.i > 0) goToStationV25(state.i - 1, 'back'); };
  }
}

const originalRenderV25 = render;
render = function renderV25() {
  originalRenderV25();
  requestAnimationFrame(enhanceTourNavigationV25);
};

if (!window.__tourPilotV25Observer) {
  window.__tourPilotV25Observer = true;
  const target = document.getElementById('screen');
  if (target) new MutationObserver(() => requestAnimationFrame(enhanceTourNavigationV25)).observe(target, { childList: true, subtree: true });
}

function api(action, params = {}) {
  const activeUrl = 'https://script.google.com/macros/s/AKfycby8c-gyWLsty4cUd0sfx4prqT1xx71ASRhGSEJADBPNmvWwOCOBuI_SAROBTrIqZFvo/exec';
  return new Promise((resolve, reject) => {
    const callbackName = 'tp_' + Date.now() + Math.floor(Math.random() * 999);
    const url = new URL(activeUrl);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callbackName);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : value));
    const script = document.createElement('script');
    const timer = setTimeout(() => cleanup(new Error('Timeout')), 12000);
    window[callbackName] = payload => {
      if (payload && payload.ok === false) cleanup(new Error(payload.error || 'API Fehler'));
      else cleanup(null, payload || {});
    };
    script.onerror = () => cleanup(new Error('API Fehler'));
    script.src = url.toString();
    document.body.appendChild(script);
    function cleanup(error, payload) {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      error ? reject(error) : resolve(payload);
    }
  });
}

requestAnimationFrame(enhanceTourNavigationV25);
