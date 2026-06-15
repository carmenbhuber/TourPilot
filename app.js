const API_URL = 'https://script.google.com/macros/s/AKfycbzK9XfQkYYsTps0BATkKYS1zzZe5vdRbLw7mmMFWLbUuOBQAM_ZT7d4XbTJ7k84TlUe/exec';

const GUIDES = ['Alexandra', 'Lea', 'Damaris', 'Stefan', 'Carmen'];
const CATEGORIES = ['Bau', 'Betrieb', 'Prozesse', 'IT / Technik', 'Sicherheit', 'Ausstattung / Material', 'Kommunikation', 'Sonstiges'];
const PRIORITIES = ['Niedrig', 'Mittel', 'Hoch'];
const STATUS = ['offen', 'in Abklärung', 'beantwortet'];

const DEMO = [
  { order: 'Start', floor: '', station: 'Start', topic: 'Badge beim Hauptempfang Securitas abholen\nBlaue Überzieher-Schuhe richten\nPräsenzkontrolle durchführen', special: '', way: '', nextStation: 'Eingang Mitarbeitende' },
  { order: 1, floor: '0', station: 'Eingang Mitarbeitende', topic: 'Zutrittsmanagement\nBadgesteuerung\nLiftsteuerung', special: 'Bettenlift nur für Patiententransporte', way: 'Ambi Treppe C m. Badge → zu Fuss ins UG2 zur Wäscheausgabe', nextStation: 'Wäscheausgabe' },
  { order: 2, floor: 'UG2', station: 'Wäscheausgabe', topic: 'Regelung Berufswäsche', special: '', way: 'zu Fuss zu Garderobe', nextStation: 'Garderobe' },
  { order: 3, floor: 'UG2', station: 'Garderobe', topic: 'Nutzung Garderobenschränke\nZuteilung persönliche Schliessfächer', special: 'persönliche Schliessfächer nur für MA mit Berufswäsche\nSammlung der dreckigen Berufswäsche vor Lift', way: 'Treppe B → zu Fuss ins UG1 zum Foyer', nextStation: 'Foyer und Aula' },
  { order: 4, floor: 'UG1', station: 'Foyer und Aula', topic: 'Rapportraum Ärzte plus grosse Sitzungszimmer', special: 'Buchen von Ressourcen\nDurchführung von Weiterbildungen', way: 'zu Fuss zu Skillsräumen', nextStation: 'Skillsräume' },
  { order: 5, floor: 'UG1', station: 'Skillsräume', topic: 'PBLS - Kurse und Skills-Training', special: 'Buchung über Aus-Fort- und Weiterbildung notwendig', way: 'zu Fuss zum Empfang der Radiologie', nextStation: 'Radiologie' },
  { order: 6, floor: 'UG1', station: 'Radiologie', topic: 'Empfang Radiologie für Patienten zu Fuss', special: 'Wegführung liegender Patienten erwähnen', way: 'zu Fuss zum Empfang der Therapien', nextStation: 'Therapien' },
  { order: 7, floor: 'UG1', station: 'Therapien', topic: 'Besichtigung von einem Behandlungszimmer und einem Therapieraum', special: 'Wartebereich Therapien und PP erwähnen\nRundgang Therapiebereich', way: 'Haupttreppenhaus → zu Fuss über grosses Treppenhaus in die Eingangshalle', nextStation: 'Empfang' },
  { order: 8, floor: '0', station: 'Empfang', topic: 'Aufenthaltsraum und Snackautomaten\nAED und Notfallsituationen\nPatientenempfang', special: 'AED und REA sind mit Schildern im ganzen Haus gekennzeichnet', way: 'zu Fuss zum Eingang Notfall', nextStation: 'Notfall' },
  { order: 9, floor: '0', station: 'Notfall', topic: 'Ambulanzvorfahrt\nZufahrt Notfall mit Parkplatz', special: 'Eingang nur für Patienten und Angehörige', way: 'zu Fuss zum Schockraum', nextStation: 'Notfall Schockraum' },
  { order: 10, floor: '0', station: 'Notfall Schockraum', topic: 'Schockraum\nStationszentrale / Wartebereich', special: '', way: 'zu Fuss zum Empfang 1 Ambi', nextStation: 'Ambi Empfang 1' },
  { order: 11, floor: '0', station: 'Ambi Empfang 1', topic: 'Empfang 1 mit den zugehörigen Clustern', special: '', way: 'zu Fuss zum Empfang 2 Ambi', nextStation: 'Ambi Empfang 2' },
  { order: 12, floor: '0', station: 'Ambi Empfang 2', topic: 'Empfang 2 mit den zugehörigen Clustern', special: 'Patientenprozess im Bereich Ambulatorium', way: 'zu Fuss zum Marktplatz Ambi', nextStation: 'Ambi Marktplatz' },
  { order: 13, floor: '0', station: 'Ambi Marktplatz', topic: 'Marktplatz', special: 'Pausen und Mitarbeiterverpflegung', way: 'Nur Lift C möglich → mit dem Lift in den 8. Stock', nextStation: 'Bürowelt' },
  { order: 14, floor: '8', station: 'Bürowelt', topic: 'Aufteilung Fachbereiche Stock 8 und 9 inkl. Signaletik', special: 'Besucher Anmeldung Hauptempfang und abholen\nBettenlifte nur für Patienten- und Gütertransporte', way: 'Rundgang durch Cluster Pflege und Pädiatrie zu Lounge', nextStation: 'Bürowelt Lounge' },
  { order: 15, floor: '8', station: 'Bürowelt Lounge', topic: 'Nutzung Open Space Büro\nBesprechungszimmer\nDruckerräume\nDiktierboxen\nLounge', special: 'Garderobe Bürowelt\nLiftsteuerung mit Badge\nInformation Buchung von Sitzungszimmer', way: 'Treppe B → zu Fuss mit Treppe B auf Station 7 Gartenzimmer', nextStation: 'Station 7 Gartenzimmer' },
  { order: 16, floor: '7', station: 'Station 7 Gartenzimmer', topic: 'Gartenzimmer', special: 'interdisziplinäre Säugling- und Kleinkindstation', way: 'Rundgang durch Station im Uhrzeigersinn', nextStation: 'Station 7' },
  { order: 17, floor: '7', station: 'Station 7', topic: 'Stationsrundgang mit Empfang\nStationszentrale\nSpielen\nFamilienaufenthalt\nPatientenzimmer\nApotheke\nLager', special: 'Apotheke badgegesteuert\nSignaletik Korridor\nKanbansystem', way: 'Treppe A → zu Fuss mit Treppe A auf Station 6', nextStation: 'Station 6' },
  { order: 18, floor: '6', station: 'Station 6', topic: 'Besichtigung Wohnen und Essen Patienten\nTime Out - Zimmer', special: 'Patientenzuteilung erwähnen\nKJM > 3 Jahre und PP\nKJC > 3 Jahre = Station 5', way: 'Treppe A → zu Fuss mit Treppe 07 auf Station 4', nextStation: 'Station 4' },
  { order: 19, floor: '4', station: 'Station 4', topic: 'Gartenzimmer', special: 'Onkologie ambulant und stationär', way: 'Treppe B → zu Fuss mit Treppe B in 3. Stock', nextStation: 'Spitalpädagogik' },
  { order: 20, floor: '3', station: 'Spitalpädagogik', topic: 'Besichtigung von Schulzimmer und Werkraum', special: '', way: 'zu Fuss zu Ruhe- und Pikettzimmern', nextStation: 'Pikett- und Ruhezimmer' },
  { order: 21, floor: '3', station: 'Pikett- und Ruhezimmer', topic: 'Übernachtung und Abpumpmöglichkeit für Mitarbeitende', special: 'Regelung Pikettzimmer\nBürowelt Chirurgie / Orthopädie', way: 'zu Fuss zum Labor', nextStation: 'Labor' },
  { order: 22, floor: '3', station: 'Labor', topic: 'Glocke und Schleuse für Laborproben\nBlutentnahmeraum', special: 'Anmeldung mit Glocke und Wartebereich\nSchleuse für Laborproben', way: 'zu Fuss zur Türe Dachgarten', nextStation: 'Dachgarten' },
  { order: 23, floor: '3', station: 'Dachgarten', topic: 'Spielplatz', special: 'Übergang zum Restaurant Roof Garden HOCH\nDefinierte Öffnungszeiten für Pat. und Angehörige', way: 'Haupttreppenhaus → zu Fuss über grosses Treppenhaus in 2. Geschoss', nextStation: 'OP/Anästhesie' },
  { order: 24, floor: '2', station: 'OP/Anästhesie', topic: 'Multifunktionsraum 1', special: 'Kleine ambulante Eingriffe', way: 'Rundgang durch Bereich OP/Anästhesie', nextStation: 'OP 1' },
  { order: 25, floor: '2', station: 'OP 1', topic: 'Ein- und Ausleitung OP 1\nOP 1', special: '1 Person und Pflegende dürfen bei der Anästhesieeinleitung dabei sein', way: 'zu Fuss', nextStation: 'Aufwachraum' },
  { order: 26, floor: '2', station: 'Aufwachraum', topic: 'Aufwachraum', special: 'Eltern mit Pflege können Kinder in Aufwachraum begleiten', way: 'zu Fuss zu Zimmer 231 und 229', nextStation: 'Tagesklinik' },
  { order: 27, floor: '2', station: 'Tagesklinik', topic: 'Patientenzimmer', special: '2 4-er Zimmer\n4 2-er Zimmer', way: 'Haupttreppenhaus → zu Fuss über grosses Treppenhaus auf Station 1', nextStation: 'Station 1' },
  { order: 28, floor: '1', station: 'Station 1', topic: 'Stationsrundgang: Zimmer NEO 1\nZimmer NEO 2\nZimmer IPS und IMC', special: 'Couplet Care\nNEO 1 und NEO 2\nIPS Intensivstation und IMC', way: 'zu Fuss', nextStation: 'Passerelle' },
  { order: 29, floor: '1', station: 'Passerelle', topic: 'Passerelle zum Gebärsaal und Frauenklinik', special: 'Erstversorgung', way: 'zu Fuss zu Milchküche/Stillberatung', nextStation: 'Milchküche / Stillberatung' },
  { order: 30, floor: '1', station: 'Milchküche / Stillberatung', topic: 'Abgabe Muttermilch, Abpumpmöglichkeit Mütter', special: '', way: 'zu Fuss zu Feuerwehrlift', nextStation: 'Feuerwehrlift' },
  { order: 31, floor: '1', station: 'Feuerwehrlift', topic: 'Prioritärer Zugang für REA-Equipe\nZugang zu Helilandeplatz\nTransport von Patienten auf und von IPS\nReanimation im OKS', special: 'keine Besichtigung aus Sicherheitsgründen\nAbgabe REA-Karten für Mitarbeitende mit Patientenkontakt', way: 'Haupttreppenhaus → zu Fuss über Treppe ins EG zum Eingang Mitarbeitende', nextStation: 'Haupteingang' },
  { order: 32, floor: '0', station: 'Haupteingang', topic: 'Abschluss Führung', special: '', way: '', nextStation: 'Tour abschliessen' }
];

const state = {
  view: 'start',
  stations: DEMO,
  i: 0,
  questions: JSON.parse(localStorage.tourpilot_questions || '[]'),
  tour: JSON.parse(localStorage.tourpilot_tour || 'null'),
  filter: 'Alle'
};

const $ = id => document.getElementById(id);
const screen = $('screen');
const toast = $('toast');

document.querySelectorAll('[data-view]').forEach(button => {
  button.onclick = () => {
    state.view = button.dataset.view;
    render();
  };
});

$('menu').onclick = async () => {
  if (!API_URL) return msg('Demo-Modus: Apps-Script-URL fehlt.');
  try {
    await api('ping');
    msg('Live-Verbindung zum Google Sheet ist aktiv.');
  } catch (error) {
    msg('Google Sheet aktuell nicht erreichbar.');
  }
};

loadStations().then(render);

async function loadStations() {
  if (!API_URL) return;
  try {
    const response = await api('getStations');
    if (response.stations && response.stations.length) {
      state.stations = response.stations;
    }
    if (state.tour && state.tour.tourId) await loadQuestions();
  } catch (error) {
    msg('Google Sheet nicht erreichbar – Demo-Daten geladen.');
  }
}

async function loadQuestions() {
  if (!API_URL || !state.tour?.tourId) return;
  try {
    const response = await api('getQuestions', { tourId: state.tour.tourId });
    if (response.questions) {
      const localOtherTours = state.questions.filter(q => q.tourId !== state.tour.tourId);
      state.questions = [...localOtherTours, ...response.questions];
      localStorage.tourpilot_questions = JSON.stringify(state.questions);
    }
  } catch (error) {
    // Offline/local fallback remains available.
  }
}

function render() {
  document.querySelectorAll('[data-view]').forEach(button => {
    button.classList.toggle('active', button.dataset.view === state.view || (state.view === 'questionForm' && button.dataset.view === 'questions'));
  });

  if (state.view === 'tour') return tourView();
  if (state.view === 'questionForm') return questionForm();
  if (state.view === 'questions') return questionsView();
  if (state.view === 'finish') return finishView();
  return startView();
}

function startView() {
  const now = new Date();
  const today = state.tour?.date || now.toISOString().slice(0, 10);
  const time = state.tour?.startTime || now.toTimeString().slice(0, 5);
  const defaultTourId = 'Führung ' + today.replaceAll('-', '');

  screen.innerHTML = `
    <section class="hero"><div><h1>Neubau TourPilot</h1><p>Mobiler Guide für Mitarbeitenden-Führungen</p></div></section>
    <section class="grid">
      <h1>Tour starten</h1>
      ${row('◷', 'Datum', `<input id="date" type="date" value="${esc(today)}">`)}
      ${row('♟', 'Guide', `<select id="guide">${opts(GUIDES, state.tour?.guide || 'Carmen')}</select>`)}
      ${row('⌁', 'Tour-ID / Führung', `<input id="tourId" value="${esc(state.tour?.tourId || defaultTourId)}">`)}
      ${row('☷', 'Gruppe', `<input id="group" placeholder="z. B. Team Pflege" value="${esc(state.tour?.group || '')}">`)}
      ${row('◴', 'Startzeit', `<input id="startTime" type="time" value="${esc(time)}">`)}
      <button id="start" class="btn primary">▶ Tour starten</button>
      <div class="card lime"><strong>Standardroute – ${state.stations.length} Stationen</strong><p class="small">Fragen werden mit Tour-ID, Guide und Station gespeichert.</p></div>
    </section>`;
  $('start').onclick = startTour;
}

function row(iconLabel, label, field) {
  return `<div class="row"><span>${iconLabel}</span><div><label>${label}</label>${field}</div></div>`;
}

async function startTour() {
  state.tour = {
    date: $('date').value,
    guide: $('guide').value,
    tourId: $('tourId').value.trim(),
    group: $('group').value.trim(),
    startTime: $('startTime').value,
    status: 'offen'
  };
  if (!state.tour.tourId) return msg('Bitte Tour-ID eingeben.');

  localStorage.tourpilot_tour = JSON.stringify(state.tour);
  if (API_URL) {
    try {
      await api('saveTour', state.tour);
      await loadQuestions();
      msg('Tour im Google Sheet gestartet.');
    } catch (error) {
      msg('Tour lokal gestartet – Sheet gerade nicht erreichbar.');
    }
  }
  state.i = 0;
  state.view = 'tour';
  render();
}

function tourView() {
  if (!state.tour) {
    state.view = 'start';
    return render();
  }

  const station = state.stations[state.i] || state.stations[0];
  const current = state.i + 1;
  const total = state.stations.length;
  const progress = Math.round((current / total) * 100);
  const points = [...list(station.topic), ...list(station.special).slice(0, 3)];

  screen.innerHTML = `
    <section class="grid" style="padding-top:14px">
      <div class="card"><div class="split"><strong>Station ${current} von ${total}</strong><strong>${progress}%</strong></div><div class="progress"><div class="bar" style="width:${progress}%"></div></div></div>
      <article class="card">
        <div class="stationHead"><div class="stationIcon">${icon(station)}</div><div><div class="kicker">${esc(state.tour.tourId)} · ${esc(state.tour.guide)}</div><h1>${esc(station.station || 'Station')}</h1>${station.floor ? `<p>Geschoss: <span class="floor">${esc(station.floor)}</span></p>` : ''}</div></div>
        ${points.length ? `<ul class="bullets">${points.map(item => `<li>${esc(item)}</li>`).join('')}</ul>` : '<p class="small">Keine Detailpunkte hinterlegt.</p>'}
      </article>
      <article class="card lilac next"><div class="round">👣</div><div><div class="kicker">Nächste Station</div><strong>${esc(station.nextStation || 'Tour abschliessen')}</strong></div><span>›</span></article>
      <article class="card mint next"><div class="round">⇄</div><div><div class="kicker">Weg</div><strong>${esc(station.way || station.access || 'Keine Wegführung hinterlegt')}</strong></div></article>
      <div class="twocol"><button id="ask" class="btn ghost">✎ Frage erfassen</button><button id="next" class="btn primary">${current >= total ? 'Abschluss' : 'Weiter'} ›</button></div>
      <button id="prev" class="btn ghost" ${state.i === 0 ? 'disabled' : ''}>‹ Zurück</button>
    </section>`;

  $('ask').onclick = () => { state.view = 'questionForm'; render(); };
  $('next').onclick = () => {
    if (state.i < total - 1) state.i += 1;
    else state.view = 'finish';
    render();
  };
  $('prev').onclick = () => {
    if (state.i > 0) state.i -= 1;
    render();
  };
}

function questionForm() {
  if (!state.tour) {
    state.view = 'start';
    return render();
  }

  const station = state.stations[state.i] || {};
  screen.innerHTML = `
    <section class="grid" style="padding-top:16px">
      <h1>Frage erfassen</h1>
      <div class="chips"><span class="pill lilac">Tour-ID<br>${esc(state.tour.tourId)}</span><span class="pill lime">Station<br>${esc(station.station || '')}</span><span class="pill mint">Guide<br>${esc(state.tour.guide)}</span></div>
      <label>Kategorie</label><select id="category">${opts(CATEGORIES, 'Prozesse')}</select>
      <label>Priorität</label><div class="chips">${PRIORITIES.map(priority => `<button class="pill" data-priority="${esc(priority)}">${esc(priority)}</button>`).join('')}</div>
      <label>Frage / offener Punkt</label><textarea id="question" rows="5" placeholder="Ihre Frage oder Ihr offener Punkt..."></textarea>
      <label>Zuständig (optional)</label><input id="owner" placeholder="z. B. Technik, IT, Bau, Logistik ...">
      <button id="save" class="btn primary">▣ Frage speichern</button>
      <p class="small">Wird der aktuellen Führung eindeutig zugeordnet.</p>
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
      station: station.station || '',
      category: $('category').value,
      priority: selectedPriority,
      question: questionText,
      owner: $('owner').value.trim(),
      status: 'offen',
      answer: '',
      createdAt: new Date().toISOString()
    };

    state.questions.unshift(question);
    localStorage.tourpilot_questions = JSON.stringify(state.questions);

    if (API_URL) {
      try {
        await api('saveQuestion', question);
        await loadQuestions();
        msg('Frage im Google Sheet gespeichert.');
      } catch (error) {
        msg('Frage lokal gespeichert – Sheet gerade nicht erreichbar.');
      }
    } else {
      msg('Frage lokal gespeichert.');
    }
    state.view = 'tour';
    render();
  };
}

async function questionsView() {
  if (API_URL && state.tour?.tourId) await loadQuestions();
  const currentTourQuestions = state.questions.filter(q => !state.tour || q.tourId === state.tour.tourId);
  const filteredQuestions = state.filter === 'Alle' ? currentTourQuestions : currentTourQuestions.filter(q => q.status === state.filter);

  screen.innerHTML = `
    <section class="grid" style="padding-top:16px">
      <div class="split"><h1>Offene Fragen</h1><span class="pill">${esc(state.tour?.tourId || 'keine Tour')}</span></div>
      <div class="chips">${['Alle', ...STATUS].map(status => `<button class="pill ${state.filter === status ? 'active' : ''}" data-filter="${esc(status)}">${esc(status)}</button>`).join('')}</div>
      <div class="grid">${filteredQuestions.length ? filteredQuestions.map(qcard).join('') : '<div class="card empty"><h2>Noch keine Fragen erfasst.</h2><p>Fragen können direkt bei der passenden Station gespeichert werden.</p></div>'}</div>
    </section>`;

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.onclick = () => {
      state.filter = button.dataset.filter;
      render();
    };
  });
}

function qcard(question) {
  const color = question.status === 'beantwortet' ? 'lime' : question.status === 'in Abklärung' ? 'mint' : 'lilac';
  return `<article class="card ${color}"><div class="qmeta"><span>Station ${esc(question.stationNr)} – ${esc(question.station)}</span><span class="pill">${esc(question.status)}</span></div><div class="qtext">${esc(question.question)}</div><div class="qmeta"><span>Kategorie: ${esc(question.category)}</span><span>${esc(question.priority)}</span></div>${question.owner ? `<p class="small">Zuständig: ${esc(question.owner)}</p>` : ''}</article>`;
}

function finishView() {
  const currentTourQuestions = state.questions.filter(q => !state.tour || q.tourId === state.tour.tourId);
  const open = currentTourQuestions.filter(q => q.status === 'offen').length;
  const inProgress = currentTourQuestions.filter(q => q.status === 'in Abklärung').length;
  const answered = currentTourQuestions.filter(q => q.status === 'beantwortet').length;

  screen.innerHTML = `
    <section class="grid" style="padding-top:16px">
      <h1>Tour abschliessen</h1>
      <article class="card creme"><h2>${esc(state.tour?.tourId || 'Keine Tour aktiv')}</h2><p class="small">${esc(state.tour?.date || '')} · ${esc(state.tour?.startTime || '')} · ${esc(state.tour?.guide || '')}</p></article>
      <div class="stats"><div class="stat"><strong>${open}</strong><small>offen</small></div><div class="stat"><strong>${inProgress}</strong><small>in Abklärung</small></div><div class="stat"><strong>${answered}</strong><small>beantwortet</small></div></div>
      <button id="finish" class="btn petrol">⚑ Tour abschliessen</button>
      <button id="copy" class="btn ghost">Zusammenfassung kopieren</button>
    </section>`;

  $('finish').onclick = async () => {
    if (API_URL && state.tour) {
      try {
        await api('finishTour', state.tour);
        msg('Tour im Google Sheet abgeschlossen.');
        return;
      } catch (error) {
        // Fall through to local feedback.
      }
    }
    msg('Tour abgeschlossen.');
  };

  $('copy').onclick = () => {
    const text = currentTourQuestions.map(q => `Station ${q.stationNr} – ${q.station}\n[${q.status}] ${q.category}: ${q.question}`).join('\n\n');
    navigator.clipboard.writeText(text || 'Keine offenen Fragen erfasst.').then(() => msg('Zusammenfassung kopiert.'));
  };
}

function api(action, params = {}) {
  return new Promise((resolve, reject) => {
    const callbackName = 'tp_' + Date.now() + Math.floor(Math.random() * 999);
    const url = new URL(API_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('callback', callbackName);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });

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

function opts(items, selected) {
  return items.map(item => `<option ${item === selected ? 'selected' : ''}>${esc(item)}</option>`).join('');
}

function list(text) {
  return String(text || '').split('\n').map(item => item.trim()).filter(Boolean).slice(0, 7);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function icon(station) {
  const text = ((station.station || '') + ' ' + (station.topic || '')).toLowerCase();
  if (text.includes('garderobe') || text.includes('wäsche')) return '▥';
  if (text.includes('op')) return '✚';
  if (text.includes('notfall')) return '⚑';
  if (text.includes('labor')) return '⌬';
  if (text.includes('dach')) return '♧';
  return '⌖';
}

function msg(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(msg.timer);
  msg.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}
