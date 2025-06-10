const CACHE    = "menu-static-v1";
const OFFLINE  = "/offline.html";              // página simples dizendo "Sem conexão"

const ASSETS = [
  "/", "/index.html", "/style.css", "/app.js",
  "/manifest.json", OFFLINE,
  // imagens essenciais
  "/images/cheeseburger.jpg",
  "/images/baconburger.jpg",
  "/images/pizza.jpg",
  "/images/calabresa.jpg",
  "/images/refri.jpg",
  "/images/suco.jpg"
];

/* ---------- INSTALL ---------- */
self.addEventListener("install", evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ---------- ACTIVATE ---------- */
self.addEventListener("activate", evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ---------- FETCH ---------- */
self.addEventListener("fetch", evt => {
  const { request } = evt;
  if (request.method !== "GET") return;

  evt.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;                         // cache-first
      return fetch(request)
        .then(res => {
          const resClone = res.clone();
          caches.open(CACHE).then(cache => cache.put(request, resClone));
          return res;
        })
        .catch(() => caches.match(OFFLINE));             // fallback offline
    })
  );
});