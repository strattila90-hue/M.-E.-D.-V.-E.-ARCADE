// M.E.D.V.E. Arcade – offline gyorsítótár + frissítés gomb támogatás.
// Új verzió: letöltődik, és az app automatikusan átvált rá (játék közben a játék bezárásakor).
const CACHE = 'medve-arcade-v4.2.4';
const FBV = '10.14.1';
const FB_SDK = ['app', 'auth', 'firestore'].map(m => `https://www.gstatic.com/firebasejs/${FBV}/firebase-${m}-compat.js`);
const SHELL = ['./', './index.html', './firebase-config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './icon-maskable.png'];
async function tell(pct, text) {
  const cl = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
  cl.forEach(c => c.postMessage({ type: 'UPDATE_PROGRESS', pct, text }));
}
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    const all = [...SHELL, ...FB_SDK];
    let done = 0;
    await Promise.all(all.map(async u => {
      try {
        const ext = u.startsWith('http');
        const r = await fetch(ext ? u : new Request(u, { cache: 'reload' }), ext ? { mode: 'cors' } : undefined);
        if (r.ok) await c.put(u, r);
      } catch (err) {}
      done++;
      tell(Math.round(done / all.length * 100), done < all.length ? 'Letöltés…' : 'Kész');
    }));
    // első telepítéskor azonnal átvesz; frissítéskor a játékos gombnyomására vár
    if (!self.registration.active) self.skipWaiting();
  })());
});
self.addEventListener('message', e => { if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.match(e.request.url).then(r => r || fetch(e.request).then(n => { if (n.ok) { const c = n.clone(); caches.open(CACHE).then(x => x.put(e.request.url, c)); } return n; })));
    return;
  }
  if (url.origin !== location.origin) return; // Firestore / bejelentkezés: mindig hálózat
  // index/sw.js: hálózat elsőként (friss), net nélkül gyorsítótár
  // hálózat elsőként, de ha 4 mp alatt nem jön válasz (gyenge térerő) vagy nincs net: azonnal a gyorsítótárból – offline is megy
  const cached = () => caches.match(e.request, { ignoreSearch: true }).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html').then(x => x || caches.match('./')) : undefined));
  e.respondWith(new Promise(resolve => {
    let done = false;
    const fin = r => { if (!done && r) { done = true; resolve(r); } };
    const t = setTimeout(() => cached().then(r => { if (r) fin(r); }), 4000);
    fetch(e.request).then(r => { clearTimeout(t); if (r.ok && r.type === 'basic') { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } fin(r); })
      .catch(() => { clearTimeout(t); cached().then(r => { if (r) fin(r); else if (!done) { done = true; resolve(new Response('Offline', { status: 503, statusText: 'Offline' })); } }); });
  }));
});
