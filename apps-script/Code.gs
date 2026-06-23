/** Neubau TourPilot – Google Apps Script Backend v2 */
const SPREADSHEET_ID = '1yD5Mqnev2mAn-fZEBIedVdmd5m2-dqCwXzxe3UZBsPI';
const SHEET_STATIONS = 'TourPilot_Stationen';
const SHEET_TOURS = 'TourPilot_Touren';
const SHEET_QUESTIONS = 'TourPilot_Fragen';

function doGet(e) {
  const p = e && e.parameter ? e.parameter : {};
  const cb = p.callback || 'callback';
  let out;
  try {
    const a = p.action || 'ping';
    if (a === 'getStations') out = { ok: true, stations: getStations_() };
    else if (a === 'saveTour') out = { ok: true, tour: saveTour_(p) };
    else if (a === 'finishTour') out = { ok: true, tour: finishTour_(p) };
    else if (a === 'saveQuestion') out = { ok: true, question: saveQuestion_(p) };
    else if (a === 'getQuestions') out = { ok: true, questions: getQuestions_(p.tourId) };
    else out = { ok: true, message: 'TourPilot API v2 erreichbar.' };
  } catch (err) {
    out = { ok: false, error: err.message || String(err) };
  }
  return jsonp_(cb, out);
}

function jsonp_(cb, obj) {
  const safe = String(cb).replace(/[^a-zA-Z0-9_.$]/g, '');
  return ContentService
    .createTextOutput(`${safe}(${JSON.stringify(obj)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function ss_() { return SpreadsheetApp.openById(SPREADSHEET_ID); }

function sheet_(name, headers) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (headers && sh.getLastRow() === 0) sh.appendRow(headers);
  if (headers) ensureColumns_(sh, headers);
  return sh;
}

function getStations_() {
  const sh = sheet_(SHEET_STATIONS, ['Ablauf Rundgang', 'Geschoss', 'Station', 'Zugang über', 'Thema', 'Spezielles', 'Wegführung']);
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(x => String(x).trim());
  const rows = values.slice(1).map(r => obj_(headers, r)).filter(hasAny_);
  return route_(rows);
}

function route_(rows) {
  const stations = [];

  rows.forEach(r => {
    const nr = clean_(r['Ablauf Rundgang']);
    const floor = clean_(r['Geschoss']);
    const stationName = clean_(r['Station']);
    const access = clean_(r['Zugang über']);
    const topic = clean_(r['Thema']);
    const special = clean_(r['Spezielles']);
    const way = clean_(r['Wegführung']);

    if (nr !== '') {
      stations.push({
        order: nr,
        floor: floor,
        station: stationName || firstLine_(topic) || (nr.toLowerCase && nr.toLowerCase() === 'start' ? 'Start' : 'Station ' + nr),
        access: access,
        topic: topic,
        special: special,
        way: way,
        nextStation: ''
      });
      return;
    }

    // Zwischenzeilen ohne Stationsnummer gehören zur vorherigen Station.
    if (!stations.length) return;
    const last = stations[stations.length - 1];
    if (access) last.access = append_(last.access, access, ' → ');
    if (way) last.way = append_(last.way, way, ' → ');
    if (topic) last.topic = append_(last.topic, topic, '\n');
    if (special) last.special = append_(last.special, special, '\n');
  });

  stations.forEach((s, i) => {
    const next = stations[i + 1];
    s.nextStation = next ? (next.station || firstLine_(next.topic) || 'Nächste Station') : 'Tour abschliessen';
  });

  return stations;
}

function saveTour_(p) {
  const headers = ['TourID', 'Datum', 'Guide', 'Status', 'ErstelltAm', 'AbgeschlossenAm', 'Teilnehmerzahl'];
  const sh = sheet_(SHEET_TOURS, headers);
  const h = getHeaders_(sh);
  const id = clean_(p.tourId || p.TourID);
  if (!id) throw new Error('TourID fehlt.');

  const vals = sh.getDataRange().getValues();
  const tourIdCol = col_(h, 'TourID');
  const idx = find_(vals, tourIdCol, id);
  const row = idx > -1 ? vals[idx].slice() : new Array(h.length).fill('');

  set_(row, h, 'TourID', id);
  set_(row, h, 'Datum', clean_(p.date || p.Datum));
  set_(row, h, 'Guide', clean_(p.guide || p.Guide));
  set_(row, h, 'Status', clean_(p.status || p.Status || 'offen'));
  set_(row, h, 'Teilnehmerzahl', clean_(p.participants || p.teilnehmerzahl || p['Teilnehmerzahl']));
  if (!get_(row, h, 'ErstelltAm')) set_(row, h, 'ErstelltAm', new Date());
  set_(row, h, 'AbgeschlossenAm', get_(row, h, 'AbgeschlossenAm'));

  if (idx > -1) sh.getRange(idx + 1, 1, 1, h.length).setValues([row]);
  else sh.appendRow(row);

  return obj_(h, row);
}

function finishTour_(p) {
  const headers = ['TourID', 'Datum', 'Guide', 'Status', 'ErstelltAm', 'AbgeschlossenAm', 'Teilnehmerzahl'];
  const sh = sheet_(SHEET_TOURS, headers);
  const h = getHeaders_(sh);
  const id = clean_(p.tourId || p.TourID);
  if (!id) throw new Error('TourID fehlt.');

  const vals = sh.getDataRange().getValues();
  const idx = find_(vals, col_(h, 'TourID'), id);
  const now = new Date();

  if (idx > -1) {
    const row = vals[idx].slice();
    set_(row, h, 'Status', 'abgeschlossen');
    set_(row, h, 'AbgeschlossenAm', now);
    sh.getRange(idx + 1, 1, 1, h.length).setValues([row]);
  } else {
    const row = new Array(h.length).fill('');
    set_(row, h, 'TourID', id);
    set_(row, h, 'Datum', clean_(p.date || p.Datum));
    set_(row, h, 'Guide', clean_(p.guide || p.Guide));
    set_(row, h, 'Status', 'abgeschlossen');
    set_(row, h, 'ErstelltAm', new Date());
    set_(row, h, 'AbgeschlossenAm', now);
    set_(row, h, 'Teilnehmerzahl', clean_(p.participants || p.teilnehmerzahl || p['Teilnehmerzahl']));
    sh.appendRow(row);
  }

  return { TourID: id, Status: 'abgeschlossen', AbgeschlossenAm: now };
}

function saveQuestion_(p) {
  const headers = ['FrageID', 'TourID', 'StationNr', 'Station', 'Kategorie', 'Priorität', 'Frage', 'Fragesteller', 'Zuständig', 'Status', 'Antwort', 'ErstelltAm'];
  const sh = sheet_(SHEET_QUESTIONS, headers);
  const h = getHeaders_(sh);

  const row = new Array(h.length).fill('');
  set_(row, h, 'FrageID', clean_(p.frageId || p.FrageID) || 'Q-' + Date.now());
  set_(row, h, 'TourID', clean_(p.tourId || p.TourID));
  set_(row, h, 'StationNr', clean_(p.stationNr || p.StationNr));
  set_(row, h, 'Station', clean_(p.station || p.Station));
  set_(row, h, 'Kategorie', clean_(p.category || p.Kategorie));
  set_(row, h, 'Priorität', clean_(p.priority || p['Priorität']));
  set_(row, h, 'Frage', clean_(p.question || p.Frage));
  set_(row, h, 'Fragesteller', clean_(p.asker || p.fragesteller || p.Fragesteller));
  set_(row, h, 'Zuständig', clean_(p.owner || p['Zuständig']));
  set_(row, h, 'Status', clean_(p.status || p.Status) || 'offen');
  set_(row, h, 'Antwort', clean_(p.answer || p.Antwort));
  set_(row, h, 'ErstelltAm', new Date());

  if (!get_(row, h, 'TourID')) throw new Error('TourID fehlt.');
  if (!get_(row, h, 'Frage')) throw new Error('Frage fehlt.');

  sh.appendRow(row);
  return obj_(h, row);
}

function getQuestions_(tourId) {
  const headers = ['FrageID', 'TourID', 'StationNr', 'Station', 'Kategorie', 'Priorität', 'Frage', 'Fragesteller', 'Zuständig', 'Status', 'Antwort', 'ErstelltAm'];
  const sh = sheet_(SHEET_QUESTIONS, headers);
  const v = sh.getDataRange().getValues();
  if (v.length < 2) return [];
  const h = v[0].map(x => String(x).trim());

  return v.slice(1)
    .map(r => obj_(h, r))
    .filter(r => !tourId || clean_(r.TourID) === clean_(tourId))
    .map(r => ({
      frageId: clean_(r.FrageID),
      tourId: clean_(r.TourID),
      stationNr: clean_(r.StationNr),
      station: clean_(r.Station),
      category: clean_(r.Kategorie),
      priority: clean_(r['Priorität']),
      question: clean_(r.Frage),
      asker: clean_(r.Fragesteller),
      fragesteller: clean_(r.Fragesteller),
      owner: clean_(r['Zuständig']),
      status: clean_(r.Status) || 'offen',
      answer: clean_(r.Antwort),
      createdAt: clean_(r.ErstelltAm)
    }))
    .reverse();
}

function getHeaders_(sh) {
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(x => String(x).trim());
}

function ensureColumns_(sh, required) {
  if (sh.getLastRow() === 0) {
    sh.appendRow(required);
    return;
  }
  let headers = getHeaders_(sh);
  const missing = required.filter(x => !headers.includes(x));
  if (!missing.length) return;
  sh.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
}

function obj_(h, r) { const o = {}; h.forEach((x, i) => o[x] = r[i]); return o; }
function hasAny_(r) { return Object.keys(r).some(k => clean_(r[k]) !== ''); }
function clean_(v) { if (v === null || v === undefined) return ''; if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); return String(v).replace(/\r/g, '').trim(); }
function append_(a, b, sep) { return a ? a + sep + b : b; }
function firstLine_(text) { return clean_(text).split('\n').map(x => x.trim()).filter(Boolean)[0] || ''; }
function col_(headers, name) { const i = headers.indexOf(name); if (i < 0) throw new Error('Spalte fehlt: ' + name); return i; }
function find_(rows, col, val) { for (let i = 1; i < rows.length; i++) { if (clean_(rows[i][col]) === clean_(val)) return i; } return -1; }
function set_(row, headers, name, value) { const i = headers.indexOf(name); if (i > -1) row[i] = value; }
function get_(row, headers, name) { const i = headers.indexOf(name); return i > -1 ? row[i] : ''; }
