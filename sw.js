// M.E.D.V.E. Arcade – offline gyorsítótár: telepítés után net nélkül is játszható.
// A ranglista netet igényel; net nélkül elért rekordok a következő kapcsolódáskor feltöltődnek.
const CACHE = 'medve-arcade-v1.8.1';
const FBV = '10.14.1';
const FB_SDK = ['app', 'auth', 'firestore'].map(m => `https://www.gstatic.com/firebasejs/${FBV}/firebase-${m}-compat.js`);
const SHELL = ['./', './index.html', './firebase-config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './icon-maskable.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([
    c.addAll(SHELL),
    ...FB_SDK.map(u => fetch(u, { mode: 'cors' }).then(r => r.ok && c.put(u, r)).catch(() => {}))
  ])).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Firebase könyvtár: verziózott, nem változik → elsőként a gyorsítótárból
  if (url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.match(e.request.url).then(r => r || fetch(e.request).then(n => { if (n.ok) { const c = n.clone(); caches.open(CACHE).then(x => x.put(e.request.url, c)); } return n; })));
    return;
  }
  if (url.origin !== location.origin) return; // Firestore / bejelentkezés: mindig hálózat
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
