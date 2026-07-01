// TourPilot v2.6: Online-/Offline-Karte nur auf Startscreen anzeigen
(function () {
  function queue() {
    try { return JSON.parse(localStorage.getItem('tourpilot_sync_queue_v1') || '[]'); }
    catch (error) { return []; }
  }

  function addStartOnlyStatusCard() {
    document.querySelectorAll('#offlineStatusV25').forEach(card => card.remove());
    if (state.view !== 'start') return;

    const grid = screen.querySelector('.grid');
    if (!grid) return;

    const pending = queue();
    const cachedDate = localStorage.getItem('tourpilot_cached_stations_date_v1') || '';
    const onlineText = navigator.onLine ? 'Online' : 'Offline';
    const cacheText = cachedDate ? `Route lokal gespeichert: ${cachedDate}` : 'Route wird beim ersten Online-Öffnen lokal gespeichert.';
    const queueText = pending.length ? `${pending.length} Eintrag/Einträge warten auf Synchronisierung.` : 'Keine offenen Offline-Einträge.';

    const card = document.createElement('article');
    card.id = 'offlineStatusV25';
    card.className = 'card mint';
    card.innerHTML = `<div class="split"><strong>${onlineText}-Modus</strong><span class="pill">offline bereit</span></div><p class="small">${esc(cacheText)}<br>${esc(queueText)}</p><div class="twocol"><button id="refreshRouteV25" class="btn primary">Route aktualisieren</button>${pending.length ? '<button id="syncOfflineV25" class="btn ghost">Jetzt synchronisieren</button>' : ''}</div>`;
    grid.prepend(card);

    const refreshButton = card.querySelector('#refreshRouteV25');
    if (refreshButton && typeof refreshRouteV25 === 'function') refreshButton.onclick = refreshRouteV25;

    const syncButton = card.querySelector('#syncOfflineV25');
    if (syncButton && typeof syncOfflineV25 === 'function') syncButton.onclick = syncOfflineV25;
  }

  window.addOfflineCardV25 = addStartOnlyStatusCard;
  requestAnimationFrame(addStartOnlyStatusCard);
})();
