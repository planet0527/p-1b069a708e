/* オフラインでも使えるように、アプリのファイルを端末に保存する */
const CACHE = "kamokuA-v7";
const FILES = ["./","index.html","data.js?v=7","visuals.js?v=7","glossary.js?v=7","terms.js?v=7","terms2.js?v=7","dbterms.js?v=7","lessons2.js?v=7","guide.js?v=7","questions.js?v=7","app.js?v=7","extras.js?v=7","learn.js?v=7","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if(new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g")) caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
