/* Dönen Dünya: scoped offline cache. Privacy and game navigations use separate keys. */
const PREFIX = 'donen-dunya:' + self.registration.scope + ':';
const VERSION = PREFIX + 'privacy-20261116-1';
const FILES = ['index.html','privacy.html','manifest.webmanifest','ikon-192.png','ikon-512.png','ikon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (request.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const isGame = request.mode === 'navigate' && (url.pathname === scope.pathname || url.pathname === new URL('index.html',scope).pathname);
  const key = isGame ? new URL('index.html',scope).href : request;
  event.respondWith(fetch(request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(VERSION).then(cache => cache.put(key,copy)).catch(() => {}));
    }
    return response;
  }).catch(() => caches.open(VERSION).then(cache => cache.match(key,{ignoreSearch:true})).then(response => response || Response.error())));
});
