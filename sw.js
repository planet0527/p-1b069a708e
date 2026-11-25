/* オフラインでも使えるように、アプリのファイルを端末に保存する */
const CACHE = "kamokuA-v13";
const FILES = ["./","index.html","data.js?v=13","visuals.js?v=13","glossary.js?v=13","terms.js?v=13","terms2.js?v=13","terms3.js?v=13","dbterms.js?v=13","lessons2.js?v=13","guide.js?v=13","questions.js?v=13","app.js?v=13","extras.js?v=13","learn.js?v=13","layout.js?v=13","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); if(new URL(e.request.url).origin === location.origin || e.request.url.includes("fonts.g")) caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

