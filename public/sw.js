/* The Farm 1893 — offline-light service worker.
   Caches the app shell + static assets (cache-first) and falls back to the
   cache for navigations when the network is unavailable. Intentionally simple:
   it never caches API responses or dashboard data. */
const CACHE = "farm1893-v1";
const SHELL = ["/", "/offline", "/favicon.svg", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Never intercept API, auth, or cross-origin requests.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api")) return;

  if (request.mode === "navigate") {
    // Network-first for pages, cache fallback (then offline page) when down.
    e.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(request).then((r) => r || caches.match("/offline")))
    );
    return;
  }

  // Cache-first for static assets.
  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok && (url.pathname.startsWith("/_next/static") || SHELL.includes(url.pathname))) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
      }
      return res;
    }))
  );
});
