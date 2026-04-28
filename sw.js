// sw.js — minimal service worker stub
// Prevents 404 on every page load from core.js registration.
// Extend with caching strategies when PWA support is needed.

self.addEventListener('install', function (e) {
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (e) {
    // Pass-through: no caching, no offline support yet.
});
