// TourPilot v2.2 fixes: remove duplicated station number in title, scroll top, save participant aliases
const TOURPILOT_V2_2_ASSET = '20260623-v2-2';

function scrollScreenTopV22() {
  requestAnimationFrame(() => {
    const target = document.getElementById('screen');
    if (target && typeof target.scrollTo === 'function') target.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

function normalizeStationTitleV22() {
  requestAnimationFrame(() => {
    const title = document.querySelector('.stationHead h1');
    if (!title) return;
    title.textContent = title.textContent.replace(/^\s*Station\s+[^·]+·\s*/i, '').trim();
  });
}

if (typeof render === 'function' && !window.__tourPilotRenderWrappedV22) {
  const baseRenderV22 = render;
  window.__tourPilotRenderWrappedV22 = true;
  render = function () {
    baseRenderV22();
    normalizeStationTitleV22();
    scrollScreenTopV22();
  };
}

async function startTour() {
  if (!state.stations.length) await loadStations();
  if (!state.stations.length) return msg('Keine Stationen geladen – bitte Google Sheet / Verbindung prüfen.');
  const participants = $('participants') ? $('participants').value.trim() : '';
  state.tour = {
    date: $('date').value,
    Datum: $('date').value,
    guide: $('guide').value,
    Guide: $('guide').value,
    tourId: $('tourId').value.trim(),
    TourID: $('tourId').value.trim(),
    participants: participants,
    teilnehmerzahl: participants,
    Teilnehmerzahl: participants,
    status: 'offen',
    Status: 'offen'
  };
  if (!state.tour.tourId) return msg('Bitte Tour-ID eingeben.');
  localStorage.tourpilot_tour = JSON.stringify(state.tour);
  try {
    await api('saveTour', state.tour);
    await loadQuestions();
    msg('Tour im Google Sheet gestartet.');
  } catch (error) {
    msg('Tour lokal gestartet – Sheet gerade nicht erreichbar.');
  }
  state.i = 0;
  state.view = 'tour';
  render();
}

normalizeStationTitleV22();
