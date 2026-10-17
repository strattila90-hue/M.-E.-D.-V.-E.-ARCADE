// M.E.D.V.E. Arcade – offline gyorsítótár + frissítés előrehaladás
const CACHE = 'medve-arcade-v1.11.0';
const FBV = '10.14.1';
const FB_SDK = ['app', 'auth', 'firestore'].map(m => `https://www.gstatic.com/firebasejs/${FBV}/firebase-${m}-compat.js`);
const SHELL = ['./', './index.html', './firebase-config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './icon-maskable.png'];

function postProgress(pct, text) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    clients.forEach(c => c.postMessage({ type: 'UPDATE_PROGRESS', pct, text }));
  });
}

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const all = [...SHELL, ...FB_SDK];
    let done = 0;
    postProgress(0, 'Frissítés letöltése…');
    for (const url of all) {
      try {
        const res = await fetch(url, { cache: 'no-cache', mode: url.startsWith('http') ? 'cors' : 'same-origin' });
        if (res.ok) await cache.put(url, res);
      } catch (_) {}
      done++;
      const pct = Math.round((done / all.length) * 100);
      postProgress(pct, `Letöltés: ${pct}%`);
    }
    postProgress(100, 'Kész');
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === 'https://www.gstatic.com' && url.pathname.startsWith('/firebasejs/')) {
    e.respondWith(caches.match(e.request.url).then(r => r || fetch(e.request).then(n => {
      if (n.ok) { const c = n.clone(); caches.open(CACHE).then(x => x.put(e.request.url, c)); }
      return n;
    })));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      const c = r.clone();
      caches.open(CACHE).then(x => x.put(e.request, c));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
