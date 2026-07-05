const CACHE = "musify-plus-v1";

const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/sw.js",
  "/assets/css/style.css",
  "/assets/js/app.js",
  "/assets/lib/jszip.min.js",
  "/assets/lib/idb.min.js",
  "/assets/images/icon.png"
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
