# Neubau TourPilot

Mobile Web-App für die Mitarbeitenden-Führungen durch den Neubau des Ostschweizer Kinderspitals.

## Version 1

- Standardroute aus dem Google-Sheet-Tab `TourPilot_Stationen`
- Startscreen mit Datum, Guide, Tour-ID, Gruppe und Startzeit
- geführte Stationsansicht mit aktueller Station, nächster Station und Wegführung
- Fragen pro Station erfassen
- offene Fragen pro Führung anzeigen
- Tour abschliessen
- OKS-Look mit Marine, Flieder, Limette, Creme, Himmelblau, Smaragd und Petrol

## Google-Sheet-Tabs

### `TourPilot_Stationen`

Die bestehende Excel-Struktur kann direkt hineinkopiert werden. Bitte die Spalten exakt so belassen:

```text
Ablauf Rundgang | Geschoss | Station | Zugang über | Thema | Spezielles | Wegführung
```

Die App erkennt jede Zeile mit Wert in `Ablauf Rundgang` als Station. Zwischenzeilen ohne Stationsnummer, aber mit `Zugang über` oder `Wegführung`, werden automatisch als Weg zur nächsten Station verarbeitet.

### `TourPilot_Touren`

```text
TourID | Datum | Startzeit | Guide | Gruppe | Status | ErstelltAm | AbgeschlossenAm
```

### `TourPilot_Fragen`

```text
FrageID | TourID | StationNr | Station | Kategorie | Priorität | Frage | Zuständig | Status | Antwort | ErstelltAm
```

## Kategorien

- Bau
- Betrieb
- Prozesse
- IT / Technik
- Sicherheit
- Ausstattung / Material
- Kommunikation
- Sonstiges

## Google Apps Script einrichten

1. Im Google Sheet auf **Erweiterungen → Apps Script** gehen.
2. Den Inhalt aus `apps-script/Code.gs` einfügen.
3. Als Web-App bereitstellen: **Bereitstellen → Neue Bereitstellung → Web-App**.
4. Ausführen als: **Ich**.
5. Zugriff: **Jede Person mit dem Link**.
6. Die Web-App-URL kopieren.
7. In `app.js` eintragen:

```js
const API_URL = 'https://script.google.com/macros/s/.../exec';
```

Ohne `API_URL` läuft die App im Demo-Modus und speichert Fragen lokal im Browser.

## GitHub Pages

Repository → **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`, Folder `/root`.

Danach ist die App voraussichtlich hier erreichbar:

```text
https://carmenbhuber.github.io/TourPilot/
```
