// TourPilot v2 patch: Startseite, Stationen, Karten, Teilnehmerzahl, Fragesteller
const TOURPILOT_V2_ASSET = '20260623-v2';
const FLOOR_MAPS_V2 = {
  'UG2': { title: 'Karte UG2', src: 'assets/ug2-map.png' },
  'UG1': { title: 'Karte UG1', src: 'assets/ug1-map.png' },
  '0': { title: 'Karte EG', src: 'assets/floor0-map.png' },
  'EG': { title: 'Karte EG', src: 'assets/floor0-map.png' },
  '1': { title: 'Karte 1. Stock', src: 'assets/floor1-map.png' },
  '2': { title: 'Karte 2. Stock', src: 'assets/floor2-map.png' },
  '3': { title: 'Karte 3. Stock', src: 'assets/floor3-map.png' },
  '4': { title: 'Karte 4. Stock', src: 'assets/floor4-map.png' },
  '6': { title: 'Karte 6. Stock', src: 'assets/floor6-map.png' },
  '7': { title: 'Karte 7. Stock', src: 'assets/floor7-map.png' },
  '8': { title: 'Karte 8. Stock', src: 'assets/floor8-map.png' }
};

function startView() {
  const now = new Date();
  const today = state.tour?.date || now.toISOString().slice(0, 10);
  const defaultTourId = 'Führung ' + today.replaceAll('-', '');
  const stationCount = state.stations.length;
  screen.innerHTML = `
    <section class="hero photoHero">
      <img src="assets/neubau-start.jpg?v=${TOURPILOT_V2_ASSET}" alt="Neubau OKS">
      <div><h1>Neubau TourPilot</h1><p>Mobiler Guide für Mitarbeitenden-Führungen</p></div>
    </section>
    <section class="grid">
      <h1>Tour starten</h1>
      ${row('◷','Datum',`<input id="date" type="date" value="${esc(today)}">`)}
      ${row('♟','Guide',`<select id="guide">${opts(GUIDES, state.tour?.guide || 'Carmen')}</select>`)}
      ${row('⌁','Tour-ID / Führung',`<input id="tourId" value="${esc(state.tour?.tourId || defaultTourId)}">`)}
      ${row('👥','Teilnehmende heute',`<input id="participants" type="number" min="0" inputmode="numeric" placeholder="z. B. 12" value="${esc(state.tour?.participants || state.tour?.teilnehmerzahl || '')}">`)}
      <button id="start" class="btn primary">▶ Tour starten</button>
      <div class="card lime"><strong>Standardroute – ${stationCount} Stationen</strong><p class="small">Stationen und Inhalte werden live aus dem Google Sheet geladen.</p></div>
      <article class="card creme"><div class="split"><strong>😊 Fun-Facts</strong><span class="pill">neu</span></div><p class="small">Themenwelt & Fun-Facts erscheinen direkt bei den passenden Stationen.</p></article>
    </section>`;
  $('start').onclick = startTour;
}

async function startTour() {
  if (!state.stations.length) await loadStations();
  if (!state.stations.length) return msg('Keine Stationen geladen – bitte Google Sheet / Verbindung prüfen.');
  state.tour = {
    date: $('date').value,
    guide: $('guide').value,
    tourId: $('tourId').value.trim(),
    participants: $('participants').value.trim(),
    teilnehmerzahl: $('participants').value.trim(),
    status: 'offen'
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
      <article class="card"><div class="stationHead"><div class="stationIcon">${esc(orderLabel || current)}</div><div><div class="kicker">${esc(state.tour.tourId)} · ${esc(state.tour.guide)}</div><h1>${orderLabel ? `Station ${esc(orderLabel)} · ` : ''}${esc(stationTitle)}</h1>${station.floor ? `<p>Geschoss: <span class="floor">${esc(station.floor)}</span></p>` : ''}</div></div></article>
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
}

function getMap(floor) {
  const key = String(floor ?? '').trim().toUpperCase();
  return FLOOR_MAPS_V2[key] || null;
}

function showMap(map) {
  const overlay = document.createElement('div');
  overlay.className = 'mapOverlay';
  overlay.innerHTML = `
    <div class="mapSheet mapSheetLarge">
      <div class="mapHeader"><div><h2>${esc(map.title)}</h2><p>Mit zwei Fingern zoomen · mit einem Finger verschieben</p></div><button id="closeMap" class="mapIconBtn">×</button></div>
      <div id="mapViewport" class="mapViewport"><div id="mapContent" class="mapContent"><img class="mapImage" src="${esc(map.src)}?v=${TOURPILOT_V2_ASSET}" alt="${esc(map.title)}"></div></div>
    </div>`;
  document.body.appendChild(overlay);
  const viewport = overlay.querySelector('#mapViewport');
  const content = overlay.querySelector('#mapContent');
  const close = () => overlay.remove();
  overlay.querySelector('#closeMap').onclick = close;
  overlay.onclick = event => { if (event.target === overlay) close(); };
  const transform = { x: 0, y: 0, scale: 1, minScale: 1, maxScale: 4 };
  const pointers = new Map();
  let start = null;
  const apply = () => { content.style.transform = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`; };
  const clamp = () => {
    const rect = viewport.getBoundingClientRect();
    const baseH = content.offsetHeight || rect.height;
    const maxX = Math.max(0, (rect.width * transform.scale - rect.width) / 2);
    const maxY = Math.max(0, (baseH * transform.scale - rect.height) / 2);
    transform.x = Math.max(-maxX, Math.min(maxX, transform.x));
    transform.y = Math.max(-maxY, Math.min(maxY, transform.y));
  };
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  viewport.addEventListener('pointerdown', event => {
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) start = { type: 'pan', x: event.clientX, y: event.clientY, originX: transform.x, originY: transform.y };
    else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      start = { type: 'pinch', dist: distance(a, b), mid: midpoint(a, b), scale: transform.scale, originX: transform.x, originY: transform.y };
    }
  });
  viewport.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1 && start?.type === 'pan') {
      transform.x = start.originX + (event.clientX - start.x);
      transform.y = start.originY + (event.clientY - start.y);
      clamp(); apply();
    } else if (pointers.size === 2 && start?.type === 'pinch') {
      const [a, b] = [...pointers.values()];
      const mid = midpoint(a, b);
      transform.scale = Math.max(transform.minScale, Math.min(transform.maxScale, start.scale * (distance(a, b) / start.dist)));
      transform.x = start.originX + (mid.x - start.mid.x);
      transform.y = start.originY + (mid.y - start.mid.y);
      clamp(); apply();
    }
  });
  const endPointer = event => {
    pointers.delete(event.pointerId);
    if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      start = { type: 'pan', x: p.x, y: p.y, originX: transform.x, originY: transform.y };
    } else start = null;
  };
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  apply();
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
    const question = {
      frageId: 'Q-' + Date.now(),
      tourId: state.tour.tourId,
      stationNr: station.order || state.i + 1,
      station: station.station || station.topic || '',
      category: $('category').value,
      priority: selectedPriority,
      question: questionText,
      asker: $('asker').value.trim(),
      fragesteller: $('asker').value.trim(),
      owner: $('owner').value.trim(),
      status: 'offen',
      answer: '',
      createdAt: new Date().toISOString()
    };
    state.questions.unshift(question);
    localStorage.tourpilot_questions = JSON.stringify(state.questions);
    try { await api('saveQuestion', question); await loadQuestions(); msg('Frage im Google Sheet gespeichert.'); }
    catch (error) { msg('Frage lokal gespeichert – Sheet gerade nicht erreichbar.'); }
    state.view = 'tour';
    render();
  };
}

function qcard(question) {
  const color = question.status === 'beantwortet' ? 'lime' : question.status === 'in Abklärung' ? 'mint' : 'lilac';
  const asker = question.asker || question.fragesteller || '';
  return `<article class="card ${color}"><div class="qmeta"><span>Station ${esc(question.stationNr)} – ${esc(question.station)}</span><span class="pill">${esc(question.status)}</span></div><div class="qtext">${esc(question.question)}</div><div class="qmeta"><span>Kategorie: ${esc(question.category)}</span><span>${esc(question.priority)}</span></div>${asker ? `<p class="small">Fragesteller: ${esc(asker)}</p>` : ''}${question.owner ? `<p class="small">Zuständig: ${esc(question.owner)}</p>` : ''}</article>`;
}

function finishView() {
  const currentTourQuestions = state.questions.filter(q => !state.tour || q.tourId === state.tour.tourId);
  const open = currentTourQuestions.filter(q => q.status === 'offen').length;
  const inProgress = currentTourQuestions.filter(q => q.status === 'in Abklärung').length;
  const answered = currentTourQuestions.filter(q => q.status === 'beantwortet').length;
  screen.innerHTML = `<section class="grid" style="padding-top:16px"><h1>Tour abschliessen</h1><article class="card creme"><h2>${esc(state.tour?.tourId || 'Keine Tour aktiv')}</h2><p class="small">${esc(state.tour?.date || '')} · ${esc(state.tour?.guide || '')} · ${esc(state.tour?.participants || '')} Teilnehmende</p></article><div class="stats"><div class="stat"><strong>${open}</strong><small>offen</small></div><div class="stat"><strong>${inProgress}</strong><small>in Abklärung</small></div><div class="stat"><strong>${answered}</strong><small>beantwortet</small></div></div><button id="finish" class="btn petrol">⚑ Tour abschliessen</button><button id="copy" class="btn ghost">Zusammenfassung kopieren</button></section>`;
  $('finish').onclick = async () => { if (state.tour) { try { await api('finishTour', state.tour); msg('Tour im Google Sheet abgeschlossen.'); return; } catch (error) {} } msg('Tour abgeschlossen.'); };
  $('copy').onclick = () => {
    const text = currentTourQuestions.map(q => {
      const asker = q.asker || q.fragesteller || '';
      return `Station ${q.stationNr} – ${q.station}\n[${q.status}] ${q.category}: ${q.question}${asker ? '\nFragesteller: ' + asker : ''}`;
    }).join('\n\n');
    navigator.clipboard.writeText(text || 'Keine offenen Fragen erfasst.').then(() => msg('Zusammenfassung kopiert.'));
  };
}

function paragraphsV2(text) {
  return String(text || '').split('\n').map(item => item.trim()).filter(Boolean).map(item => `<p>${esc(item)}</p>`).join('');
}

render();
