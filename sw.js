/* オフラインでも使えるように、アプリのファイルを端末に保存する */
const CACHE = "kamokuA-v9";
const FILES = ["./","index.html","data.js?v=9","visuals.js?v=9","glossary.js?v=9","terms.js?v=9","terms2.js?v=9","dbterms.js?v=9","lessons2.js?v=9","guide.js?v=9","questions.js?v=9","app.js?v=9","extras.js?v=9","learn.js?v=9","layout.js?v=9","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if(new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g")) caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
