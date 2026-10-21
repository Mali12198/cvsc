// Offline cache for the home-screen app. The version changes whenever a file changes.
const CACHE = 'cvc-9681bf938b';
const FILES = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "sprites/brutus.webp",
  "sprites/dummy.webp",
  "sprites/fauchbert.webp",
  "sprites/krallissima.webp",
  "sprites/mecha.webp",
  "sprites/minka.webp",
  "sprites/rooster.webp",
  "sprites/rooster_frost.webp",
  "sprites/rooster_gold.webp",
  "sprites/rooster_night.webp",
  "sprites/schatten.webp",
  "sprites/socke.webp",
  "sprites/wanda.webp",
  "sprites/zorra.webp",
  "bg/factory.webp",
  "bg/farm.webp",
  "bg/roofs.webp",
  "bg/title.webp"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // the page itself: try the network first so updates arrive, fall back to the cache offline
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return res; })
      .catch(() => caches.match('index.html')));
    return;
  }
  // everything else (images, fonts): cache first, then network, and keep what we fetched
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque') && (url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname.endsWith('googleapis.com'))) {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
    }
    return res;
  })));
});
