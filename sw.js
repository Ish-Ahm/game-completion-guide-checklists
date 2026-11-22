// Bump CACHE (a version like 1.3.0) whenever any file changes, so phones pick up the new version.
const CACHE = "checklists-v1.4.13";
const FILES = [
  "./",
  "manifest.json",
  "img/icons/steam-trophy.svg",
  "sync.js",
  "steam-sync.js",
  "steam-map.json",
  "icon-192.png",
  "icon-512.png",
  "img/cards/re4.webp",
  "img/cards/gta4.webp",
  "img/cards/p4g.webp",
  "img/cards/halo-mcc.webp",
  "img/cards/vanquish.webp",
  "img/cards/dmc1.webp",
  "img/cards/sunset-overdrive.webp",
  "img/cards/stick-of-truth.webp",
  "img/cards/re7.webp",
  "img/cards/ace-attorney-trilogy.webp",
  "img/cards/ac-syndicate.webp",
  "img/cards/metal-gear-solid.webp",
  "img/cards/mgs2.webp",
  "img/cards/re8.webp",
  "img/cards/re2.webp",
  "img/guides/re2/re2-gs-forgotten-soldier-loadout-no-training.webp",
  "img/guides/re2/re2-gs-forgotten-soldier-loadout-training.webp",
  "img/guides/re2/re2-gs-forgotten-soldier-menu.webp",
  "img/guides/re2/re2-gs-forgotten-soldier-raccoon-1-map.webp",
  "img/guides/re2/re2-gs-forgotten-soldier-raccoon-1.webp",
  "img/guides/re2/re2-gs-forgotten-soldier-raccoon-2-map.webp",
  "img/guides/re2/re2-gs-forgotten-soldier-raccoon-2.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-loadout-no-training.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-loadout-training.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-menu.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-1-map.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-1.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-2-map.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-2.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-3-map.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-3.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-4-map.webp",
  "img/guides/re2/re2-gs-no-time-to-mourn-raccoon-4.webp",
  "img/guides/re2/re2-gs-no-way-out-loadout-no-training.webp",
  "img/guides/re2/re2-gs-no-way-out-loadout-training.webp",
  "img/guides/re2/re2-gs-no-way-out-menu.webp",
  "img/guides/re2/re2-gs-no-way-out-raccoon-1.webp",
  "img/guides/re2/re2-gs-runaway-loadout-no-training.webp",
  "img/guides/re2/re2-gs-runaway-loadout-training.webp",
  "img/guides/re2/re2-gs-runaway-menu.webp",
  "img/guides/re2/re2-gs-runaway-raccoon-1-map.webp",
  "img/guides/re2/re2-gs-runaway-raccoon-1.webp",
  "img/guides/re2/re2-gs-runaway-raccoon-2-map.webp",
  "img/guides/re2/re2-gs-runaway-raccoon-2.webp",
  "img/guides/re2/re2-gs-runaway-raccoon-3-map.webp",
  "img/guides/re2/re2-gs-runaway-raccoon-3.webp",
  "img/cards/borderlands-1.webp",
  "img/guides/borderlands-1/borderlands-1-base-map-pandora.webp",
  "img/guides/borderlands-1/borderlands-1-base-map-treachers-landing-boat.webp",
  "img/guides/borderlands-1/borderlands-1-ned-map-jakobs-cove.webp",
  "img/guides/borderlands-1/borderlands-1-ned-map-tk-baha.webp"
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
  if (url.origin === location.origin && url.pathname.startsWith("/api/")) return; // never cache the sync API
  if (url.origin === location.origin) {
    // Cache-first for our own files; fall back to the network and keep a copy.
    e.respondWith(
      caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => req.mode === "navigate" ? caches.match("./") : Response.error()))
    );
  } else if (url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com")) {
    // Web fonts used by some checklists: cached on first use so they work offline too.
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
  }
});
