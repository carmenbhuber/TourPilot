const CACHE_NAME = 'tourpilot-offline-v1';
const CORE_ASSETS = [
  './', './index.html', './styles.css', './tourpilot-fixes.css', './tourpilot-v2-3.css', './tourpilot-v2-5.css',
  './app.js', './tourpilot-v2.js', './tourpilot-v2-fixes.js', './tourpilot-v2-2-fixes.js', './tourpilot-v2-3-fixes.js', './tourpilot-v2-5.js',
  './manifest.json', './assets/tourpilot-icon.svg', './assets/oks-logo.svg', './assets/neubau-start.jpg',
  './assets/ug2-map.png', './assets/ug1-map.png', './assets/floor0-map.png', './assets/floor1-map.png', './assets/floor2-map.png',
  './assets/floor3-map.png', './assets/floor4-map.png', './assets/floor6-map.png', './assets/floor7-map.png', './assets/floor8-map.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request)));
});
