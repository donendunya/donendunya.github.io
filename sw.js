/* Dönen Dünya çevrimdışı katmanı. Önce ağ (yeni sürüm hemen gelir), ağ yoksa son kaydedilen kopya.
   Yalnız bu klasörün dosyaları; başka adrese dokunmaz. Sürüm: b8087624de5d */
const ON = 'donen-dunya:' + self.registration.scope + ':';   // yalnız bu oyunun, bu klasördeki önbelleği
const SURUM = ON + 'b8087624de5d';
const DOSYALAR = ['index.html', 'manifest.webmanifest', 'ikon-192.png', 'ikon-512.png', 'ikon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(L => Promise.all(L.filter(k => k.startsWith(ON) && k !== SURUM).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const anahtar = r.mode === 'navigate' ? 'index.html' : r;
  e.respondWith(fetch(r).then(y => { if (y.ok) { const k = y.clone(); caches.open(SURUM).then(c => c.put(anahtar, k)); } return y; })
    .catch(() => caches.open(SURUM).then(c => c.match(anahtar, { ignoreSearch: true })).then(y => y || Response.error())));
});
