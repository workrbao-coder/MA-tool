const CACHE_NAME = 'ma-tool-cache-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/manifest.json',
  '/version.json',
  '/icons/icon-192-v3.png',
  '/icons/icon-512-v3.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.pathname.endsWith('/version.json')) {
    event.respondWith(fetch(req).catch(()=>caches.match(req)));
    return;
  }
  event.respondWith(
    caches.match(req).then(resp => resp || fetch(req).then(r => {
      try { const copy = r.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); } catch(e){}
      return r;
    })).catch(()=> caches.match('/index.html'))
  );
});

self.addEventListener('message', (evt) => {
  const data = evt.data || {};
  if (data && data.type === 'CHECK_VERSION') {
    fetch('/version.json', {cache: "no-store"}).then(r=>r.json()).then(remote=>{
      self.clients.matchAll({includeUncontrolled:true}).then(clients=>{
        clients.forEach(c=>c.postMessage({type:'VERSION', payload: remote}));
      });
    }).catch(()=>{});
  } else if (data && data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
