/* オフラインでも使えるように、アプリのファイルを端末に保存する */
const CACHE = "kamokuA-v11";
const FILES = ["./","index.html","data.js?v=10","visuals.js?v=10","glossary.js?v=10","terms.js?v=10","terms2.js?v=10","terms3.js?v=10","dbterms.js?v=10","lessons2.js?v=10","guide.js?v=10","questions.js?v=10","app.js?v=10","extras.js?v=10","learn.js?v=10","layout.js?v=11","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if(new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g")) caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
