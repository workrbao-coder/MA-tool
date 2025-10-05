// Simple service worker for offline caching
const CACHE_NAME = 'ma-tool-cache-v1';
const FILES_TO_CACHE = ['/', '/index.html', '/manifest.json', '/version.json'];
self.addEventListener('install', evt => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});
self.addEventListener('activate', evt => evt.waitUntil(self.clients.claim()));
self.addEventListener('fetch', evt => {
  evt.respondWith(caches.match(evt.request).then(resp => resp || fetch(evt.request)));
});