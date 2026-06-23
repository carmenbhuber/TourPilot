// TourPilot v2.1 fixes: scroll top, station title, extra save aliases
const TOURPILOT_V2_FIX_ASSET = '20260623-v2-1';

function scrollScreenTopV2() {
  requestAnimationFrame(() => {
    const target = document.getElementById('screen');
    if (target && typeof target.scrollTo === 'function') target.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

if (typeof render === 'function' && !window.__tourPilotRenderWrappedV21) {
  const baseRenderV21 = render;
  window.__tourPilotRenderWrappedV21 = true;
  render = function () {
    baseRenderV21();
    scrollScreenTopV2();
  };
}

async function startTour() {
  if (!state.stations.length) await loadStations();
  if (!state.stations.length) return msg('Keine Stationen geladen – bitte Google Sheet / Verbindung prüfen.');
  const participants = $('participants') ? $('participants').value.trim() : '';
  state.tour = {
    date: $('date').value,
    guide: $('guide').value,
    tourId: $('tourId').value.trim(),
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

function tourView() {
  if (!state.tour) { state.view = 'start'; return render(); }
  if (!state.stations.length) {
    screen.innerHTML = `<section class="grid" style="padding-top:16px"><div class="card empty"><h2>Keine Stationen geladen.</h2><p>Bitte Menü oben antippen oder die Seite neu laden.</p></div></section>`;
    scrollScreenTopV2();
    return;
  }
  const station = state.stations[state.i] || state.stations[0] || {};
  const current = state.i + 1;
  const total = state.stations.length || 1;
  const progress = Math.round((current / total) * 100);
  const map = getMap(station.floor);
  const topicItems = list(station.topic, 99);
  const special = String(station.special || '').trim();
  const stationTitle = station.station || station.topic || 'Station';
  const orderLabel = station.order === 0 || station.order === '0' ? 'Start' : station.order;
  screen.innerHTML = `
    <section class="grid" style="padding-top:14px">
      <div class="card"><div class="split"><strong>Station ${current} von ${total}</strong><strong>${progress}%</strong></div><div class="progress"><div class="bar" style="width:${progress}%"></div></div></div>
      <article class="card"><div class="stationHead"><div class="stationIcon">${esc(orderLabel || current)}</div><div><div class="kicker">${esc(state.tour.tourId)} · ${esc(state.tour.guide)}</div><h1>${esc(stationTitle)}</h1>${station.floor ? `<p>Geschoss: <span class="floor">${esc(station.floor)}</span></p>` : ''}</div></div></article>
      <article class="card"><div class="sectionTitle">🗣️ Was sage ich hier?</div>${topicItems.length ? `<ul class="bullets">${topicItems.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p class="small">Noch kein Text hinterlegt.</p>'}</article>
      ${special ? `<article class="card creme funfact"><div class="sectionTitle">😊 Themenwelt & Fun-Fact</div>${paragraphsV2(special)}</article>` : ''}
      <article class="card lilac next"><div class="round">👣</div><div><div class="kicker">Nächste Station</div><strong>${esc(station.nextStation || 'Tour abschliessen')}</strong></div><span>›</span></article>
      <article class="card mint next"><div class="round">⇄</div><div><div class="kicker">Weg</div><strong>${esc(station.way || station.access || 'Keine Wegführung hinterlegt')}</strong></div></article>
      ${map ? `<button id="showMap" class="btn mapBtn">▧ ${map.title} einblenden</button>` : ''}
      <div class="twocol"><button id="ask" class="btn ghost">✎ Frage erfassen</button><button id="next" class="btn primary">${current >= total ? 'Abschluss' : 'Weiter'} ›</button></div>
      <button id="prev" class="btn ghost" ${state.i === 0 ? 'disabled' : ''}>‹ Zurück</button>
    </section>`;
  $('ask').onclick = () => { state.view = 'questionForm'; render(); };
  $('next').onclick = () => { if (state.i < total - 1) state.i += 1; else state.view = 'finish'; render(); };
  $('prev').onclick = () => { if (state.i > 0) state.i -= 1; render(); };
  if (map) $('showMap').onclick = () => showMap(map);
  scrollScreenTopV2();
}

function questionForm() {
  if (!state.tour) { state.view = 'start'; return render(); }
  const station = state.stations[state.i] || {};
  const orderLabel = station.order === 0 || station.order === '0' ? 'Start' : station.order;
  screen.innerHTML = `
    <section class="grid" style="padding-top:16px">
      <h1>Frage erfassen</h1>
      <div class="chips"><span class="pill lilac">Tour-ID<br>${esc(state.tour.tourId)}</span><span class="pill lime">Station<br>${esc(orderLabel || state.i + 1)} · ${esc(station.station || station.topic || '')}</span><span class="pill mint">Guide<br>${esc(state.tour.guide)}</span></div>
      <label>Wer hat die Frage gestellt?</label><input id="asker" placeholder="z. B. Name, Team, Bereich">
      <label>Kategorie</label><select id="category">${opts(CATEGORIES, 'Prozesse')}</select>
      <label>Priorität</label><div class="chips">${PRIORITIES.map(priority => `<button class="pill" data-priority="${esc(priority)}">${esc(priority)}</button>`).join('')}</div>
      <label>Frage / offener Punkt</label><textarea id="question" rows="5" placeholder="Ihre Frage oder Ihr offener Punkt..."></textarea>
      <label>Zuständig (optional)</label><input id="owner" placeholder="z. B. Technik, IT, Bau, Logistik ...">
      <button id="save" class="btn primary">▣ Frage speichern</button><p class="small">Wird der aktuellen Führung eindeutig zugeordnet.</p>
    </section>`;
  let selectedPriority = 'Mittel';
  document.querySelectorAll('[data-priority]').forEach(button => {
    button.classList.toggle('active', button.dataset.priority === selectedPriority);
    button.onclick = () => {
      selectedPriority = button.dataset.priority;
      document.querySelectorAll('[data-priority]').forEach(item => item.classList.toggle('active', item.dataset.priority === selectedPriority));
    };
  });
  $('save').onclick = async () => {
    const questionText = $('question').value.trim();
    if (!questionText) return msg('Bitte Frage eingeben.');
    const asker = $('asker').value.trim();
    const question = {
      frageId: 'Q-' + Date.now(),
      FrageID: 'Q-' + Date.now(),
      tourId: state.tour.tourId,
      TourID: state.tour.tourId,
      stationNr: station.order || state.i + 1,
      StationNr: station.order || state.i + 1,
      station: station.station || station.topic || '',
      Station: station.station || station.topic || '',
      category: $('category').value,
      Kategorie: $('category').value,
      priority: selectedPriority,
      'Priorität': selectedPriority,
      question: questionText,
      Frage: questionText,
      asker: asker,
      fragesteller: asker,
      Fragesteller: asker,
      owner: $('owner').value.trim(),
      'Zuständig': $('owner').value.trim(),
      status: 'offen',
      Status: 'offen',
      answer: '',
      Antwort: '',
      createdAt: new Date().toISOString()
    };
    state.questions.unshift(question);
    localStorage.tourpilot_questions = JSON.stringify(state.questions);
    try { await api('saveQuestion', question); await loadQuestions(); msg('Frage im Google Sheet gespeichert.'); }
    catch (error) { msg('Frage lokal gespeichert – Sheet gerade nicht erreichbar.'); }
    state.view = 'tour';
    render();
  };
  scrollScreenTopV2();
}

render();
