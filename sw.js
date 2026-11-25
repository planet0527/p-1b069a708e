/* このアプリのファイルだけを保存し、ほかのアプリのキャッシュを保護する。 */
const PREFIX = "kamokuA-p-1b069a708e-";
const CACHE = PREFIX + "v26";
const FILES = ["./","index.html","data.js?v=26","visuals.js?v=26","glossary.js?v=26","terms.js?v=26","terms2.js?v=26","terms3.js?v=26","dbterms.js?v=26","usage.js?v=26","lessons2.js?v=26","guide.js?v=26","questions.js?v=26","app.js?v=26","extras.js?v=26","learn.js?v=26","layout.js?v=26","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
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

