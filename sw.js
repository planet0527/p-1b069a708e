/* オフラインでも使えるように、アプリのファイルを端末に保存する */
const CACHE = "kamokuA-v12";
const FILES = ["./","index.html","data.js?v=11","visuals.js?v=11","glossary.js?v=11","terms.js?v=11","terms2.js?v=11","terms3.js?v=11","dbterms.js?v=11","lessons2.js?v=11","guide.js?v=11","questions.js?v=11","app.js?v=11","extras.js?v=11","learn.js?v=11","layout.js?v=12","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if(new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g")) caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

