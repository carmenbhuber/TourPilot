// TourPilot v2.3 fixes: station title, scroll behaviour, crisp logo support
const TOURPILOT_V2_3_ASSET = '20260623-v2-3';

function tourPilotScrollTopV23() {
  requestAnimationFrame(() => {
    const screenEl = document.getElementById('screen');
    if (screenEl && typeof screenEl.scrollTo === 'function') screenEl.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

function tourPilotCleanStationTitleV23() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.stationHead h1').forEach(title => {
      title.textContent = title.textContent.replace(/^\s*Station\s+[^·]+·\s*/i, '').trim();
    });
  });
}

// MutationObserver catches station cards that are rendered after async Google-Sheet loading.
if (!window.__tourPilotStationTitleObserverV23) {
  window.__tourPilotStationTitleObserverV23 = true;
  const target = document.getElementById('screen');
  if (target) {
    new MutationObserver(() => {
      tourPilotCleanStationTitleV23();
      tourPilotScrollTopV23();
    }).observe(target, { childList: true, subtree: true });
  }
}

if (typeof render === 'function' && !window.__tourPilotRenderWrappedV23) {
  const baseRenderV23 = render;
  window.__tourPilotRenderWrappedV23 = true;
  render = function () {
    const result = baseRenderV23.apply(this, arguments);
    tourPilotCleanStationTitleV23();
    tourPilotScrollTopV23();
    return result;
  };
}

tourPilotCleanStationTitleV23();
tourPilotScrollTopV23();
