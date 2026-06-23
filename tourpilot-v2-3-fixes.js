// TourPilot v2.3.1 fixes: station title + mobile scrolling
const TOURPILOT_V2_3_1_ASSET = '20260623-v2-3-1';

function tourPilotScrollTopV231() {
  requestAnimationFrame(() => {
    const screenEl = document.getElementById('screen');
    if (screenEl && typeof screenEl.scrollTo === 'function') screenEl.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

function tourPilotCleanStationTitleV231() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.stationHead h1').forEach(title => {
      title.textContent = title.textContent.replace(/^\s*Station\s+[^·]+·\s*/i, '').trim();
    });
  });
}

// Important: do NOT scroll on every DOM mutation. That prevented normal scrolling on mobile.
if (!window.__tourPilotStationTitleObserverV231) {
  window.__tourPilotStationTitleObserverV231 = true;
  const target = document.getElementById('screen');
  if (target) {
    new MutationObserver(() => {
      tourPilotCleanStationTitleV231();
    }).observe(target, { childList: true, subtree: true });
  }
}

if (typeof render === 'function' && !window.__tourPilotRenderWrappedV231) {
  const baseRenderV231 = render;
  window.__tourPilotRenderWrappedV231 = true;
  render = function () {
    const result = baseRenderV231.apply(this, arguments);
    tourPilotCleanStationTitleV231();
    tourPilotScrollTopV231();
    return result;
  };
}

tourPilotCleanStationTitleV231();