const CACHE = "musify-plus-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/app.js",
  "/manifest.json",
  "/sw.js",
  "https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js",
  "https://cdn.jsdelivr.net/npm/idb@7.1.1/build/iife/index-min.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE && caches.delete(key)))
    )
  );
  clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      return fetch(req).catch(() => {
        if (req.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
});
