/* このアプリのファイルだけを保存し、ほかのアプリのキャッシュを保護する。 */
const PREFIX = "kamokuA-p-1b069a708e-";
const CACHE = PREFIX + "v50";
const FILES = ["./","index.html","data.js?v=50","visuals.js?v=50","glossary.js?v=50","terms.js?v=50","terms2.js?v=50","terms3.js?v=50","dbterms.js?v=50","usage.js?v=50","lessons2.js?v=50","guide.js?v=50","questions.js?v=50","balance.js?v=50","app.js?v=50","extras.js?v=50","learn.js?v=50","layout.js?v=50","reference.js?v=50","motion.js?v=50","motion2.js?v=50","motion3.js?v=50","motion4.js?v=50","motion5.js?v=50","motion6.js?v=50","motion7.js?v=50","manifest.webmanifest","icon-192.png","icon-512.png","icon-180.png"];
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

