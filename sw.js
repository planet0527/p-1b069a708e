/* オフラインでも使えるように、アプリのファイルを端末に保存する */
const CACHE = "kamokuA-v14";
const FILES = ["./","index.html","data.js?v=14","visuals.js?v=14","glossary.js?v=14","terms.js?v=14","terms2.js?v=14","terms3.js?v=14","dbterms.js?v=14","lessons2.js?v=14","guide.js?v=14","questions.js?v=14","app.js?v=14","extras.js?v=14","learn.js?v=14","layout.js?v=14","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if(new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g")) caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

