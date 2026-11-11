// Bump CACHE whenever any file changes, so phones pick up the new version.
const CACHE = "checklists-v2";
const FILES = [
  "./",
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "checklists/re4.html",
  "checklists/gta4.html",
  "checklists/p4g.html",
  "checklists/halo-mcc.html",
  "checklists/vanquish.html",
  "checklists/dmc.html",
  "checklists/sunset-overdrive.html",
  "checklists/stick-of-truth.html",
  "checklists/sot-missables.html",
  "checklists/sot-collection.html",
  "img/re4-hero.webp",
  "img/re4-logo.webp",
  "img/gta4-hero.webp",
  "img/gta4-logo.webp",
  "img/p4g-hero.webp",
  "img/p4g-logo.webp",
  "img/halo-mcc-hero.webp",
  "img/halo-mcc-logo.webp",
  "img/vanquish-hero.webp",
  "img/stick-of-truth-hero.webp"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // Cache-first for our own files; fall back to the network and keep a copy.
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => req.mode === "navigate" ? caches.match("index.html") : Response.error()))
    );
  } else if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    // Web fonts used by some checklists: cached on first use so they work offline too.
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
});
