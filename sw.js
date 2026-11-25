/* このアプリのファイルだけを保存し、ほかのアプリのキャッシュを保護する。 */
const PREFIX = "kamokuA-p-1b069a708e-";
const CACHE = PREFIX + "v41";
const FILES = ["./","index.html","data.js?v=41","visuals.js?v=41","glossary.js?v=41","terms.js?v=41","terms2.js?v=41","terms3.js?v=41","dbterms.js?v=41","usage.js?v=41","lessons2.js?v=41","guide.js?v=41","questions.js?v=41","app.js?v=41","extras.js?v=41","learn.js?v=41","layout.js?v=41","reference.js?v=41","motion.js?v=41","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url), scope = new URL(self.registration.scope);
  if(e.request.method !== "GET" || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  const navigation = e.request.mode === "navigate";
  const key = navigation ? scope.href : e.request;
  e.respondWith(fetch(e.request).then(response => {
    if(response.ok){
      const copy = response.clone();
      e.waitUntil(caches.open(CACHE).then(c => c.put(key, copy)).catch(() => {}));
    }
    return response;
  }).catch(async () => {
    const cache = await caches.open(CACHE);
    const response = await cache.match(key);
    return response || Response.error();
  }));
});

