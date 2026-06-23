// TourPilot v2.3.2 fixes: station title only; no forced scroll loop
const TOURPILOT_V2_3_2_ASSET = '20260623-v2-3-2';

function tourPilotCleanStationTitleV232() {
  requestAnimationFrame(() => {
    document.querySelectorAll('.stationHead h1').forEach(title => {
      title.textContent = title.textContent.replace(/^\s*Station\s+[^·]+·\s*/i, '').trim();
    });
  });
}

function tourPilotAllowMobileScrollV232() {
  document.documentElement.style.overflowY = 'auto';
  document.body.style.overflowY = 'auto';
  document.body.style.touchAction = 'auto';
  const app = document.querySelector('.app');
  const screen = document.getElementById('screen');
  if (app) {
    app.style.overflow = 'visible';
    app.style.height = 'auto';
    app.style.minHeight = '100dvh';
  }
  if (screen) {
    screen.style.overflowY = 'visible';
    screen.style.touchAction = 'pan-y';
    screen.style.webkitOverflowScrolling = 'touch';
  }
}

if (!window.__tourPilotStationTitleObserverV232) {
  window.__tourPilotStationTitleObserverV232 = true;
  const target = document.getElementById('screen');
  if (target) {
    new MutationObserver(() => {
      tourPilotCleanStationTitleV232();
      tourPilotAllowMobileScrollV232();
    }).observe(target, { childList: true, subtree: true });
  }
}

tourPilotCleanStationTitleV232();
tourPilotAllowMobileScrollV232();
setTimeout(tourPilotAllowMobileScrollV232, 300);
setTimeout(tourPilotAllowMobileScrollV232, 1200);
