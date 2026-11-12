/* Steam achievement sync. Ticks checklist items for achievements already unlocked on Steam.
   It only ever ADDS ticks, never removes them. Talks to /api/steam (Pages Function) and uses steam-map.json
   (built by tools/build_steam_map.py) to turn Steam apinames into checklist item ids.
   - On a checklist page: syncs that one game, reloads once if something new was ticked, then shows a toast.
   - On the home page (window.SYNC_HOME): syncs every mapped game, then the cards re-render.
   Failures are silent on checklist pages and shown as a friendly line on the home page. */
(function () {
  "use strict";
  if (window.__steamSync) return;
  window.__steamSync = true;

  var API = "/api/steam", MAP_URL = "/steam-map.json";
  var LAST = "steam-last";           // deliberately no "-v<number>" ending: cross-device sync only copies those keys
  var PROG = "hub-progress-v1", TOAST = "steam-toast", RELOAD = "steam-reload-t";
  var HOME = !!window.SYNC_HOME;
  var status = { state: "idle", time: +get(LAST) || 0, added: 0, error: "", kind: "" };
  var busy = null;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function sdel(k) { try { sessionStorage.removeItem(k); } catch (e) {} }
  function parse(s) { try { var o = JSON.parse(s); return o && typeof o === "object" && !Array.isArray(o) ? o : null; } catch (e) { return null; } }
  function plural(n) { return n + " new achievement" + (n === 1 ? "" : "s"); }

  function thisFile() {
    var f = location.pathname.split("/").pop() || "";
    return /\.html$/.test(f) ? f : f + ".html";   // Cloudflare serves /checklists/re4 without the extension
  }

  function emit(s) {
    for (var k in s) status[k] = s[k];
    window.dispatchEvent(new CustomEvent("steam-status", { detail: status }));
  }

  function loadMap() {
    return fetch(MAP_URL, { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  // Asks the server for the unlocked apinames of the given appids. Resolves { ok, games, error, kind }, or null if offline.
  function fetchUnlocked(appids) {
    return fetch(API + "?appids=" + appids.join(","), { cache: "no-store" })
      .then(function (r) { return r.json().catch(function () { return null; }).then(function (b) { return b || { ok: false, error: "Steam sync gave no answer" }; }); })
      .then(function (b) {
        if (b && b.ok) return b;
        var msg = (b && b.error) || "Steam sync failed";
        return { ok: false, error: msg, kind: /private/i.test(msg) ? "private" : /not set up/i.test(msg) ? "config" : "other" };
      })
      .catch(function () { return null; });
  }

  // Adds ticks to the page's localStorage entry. Returns how many were new.
  function mergeInto(entry, names) {
    var raw = get(entry.key), obj = parse(raw) || {};
    var target = obj;
    if (entry.shape === "got") { if (!obj.got || typeof obj.got !== "object" || Array.isArray(obj.got)) obj.got = {}; target = obj.got; }
    var added = 0;
    for (var i = 0; i < names.length; i++) {
      var id = entry.map[names[i]];
      if (id !== undefined && id !== null && target[id] !== true) { target[id] = true; added++; }
    }
    if (added) set(entry.key, JSON.stringify(obj));   // only create/touch the entry when there is something to add
    return added;
  }

  // Home cards read a cached "x / N" readout. After new ticks, blank it so the card says "Open" until the guide is visited.
  function markStale(file) {
    var all = parse(get(PROG)) || {}, now = Date.now();
    all[file] = { t: now };
    all[file.replace(/\.html$/, "")] = { t: now };
    set(PROG, JSON.stringify(all));
  }

  function canReload() {
    var t = +sget(RELOAD) || 0;
    if (Date.now() - t < 15000) return false;
    sset(RELOAD, String(Date.now()));
    return true;
  }

  function toast(text) {
    var d = document.createElement("div");
    d.setAttribute("role", "status");
    d.textContent = text;
    d.style.cssText = "position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 64px);transform:translateX(-50%);z-index:2147483001;" +
      "max-width:min(92vw,420px);padding:.6rem 1rem;border-radius:999px;background:rgba(14,16,22,.94);color:#fff;font:600 14px/1.3 system-ui,sans-serif;" +
      "border:1px solid rgba(255,255,255,.18);box-shadow:0 6px 20px rgba(0,0,0,.5);text-align:center;transition:opacity .4s";
    document.body.appendChild(d);
    setTimeout(function () { d.style.opacity = "0"; }, 4500);
    setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 5000);
  }

  // ---- checklist page: one game ----
  function pageSync(map) {
    var entry = map[thisFile()];
    if (!entry) return;
    fetchUnlocked([entry.appid]).then(function (res) {
      if (!res || !res.ok) return;
      var names = res.games && res.games[String(entry.appid)];
      if (!names) return;
      var n = mergeInto(entry, names);
      if (!n) return;
      var msg = "Synced " + plural(n) + " from Steam";
      if (canReload()) { sset(TOAST, msg); location.reload(); } else toast(msg);
    }).catch(function () {});
  }

  // ---- home page: every mapped game ----
  function homeSync(manual) {
    if (busy) return busy;
    emit({ state: "syncing", error: "", kind: "" });
    busy = loadMap().then(function (map) {
      if (!map) throw { kind: "offline", error: "Couldn't load the Steam map" };
      var files = Object.keys(map), appids = [], i;
      files.forEach(function (f) { var a = String(map[f].appid); if (appids.indexOf(a) < 0) appids.push(a); });
      var chunks = [];
      for (i = 0; i < appids.length; i += 10) chunks.push(appids.slice(i, i + 10));
      return Promise.all(chunks.map(fetchUnlocked)).then(function (results) {
        var games = {}, failure = null, anyOk = false;
        results.forEach(function (r) {
          if (!r) { failure = failure || { kind: "offline", error: "Couldn't reach the server" }; return; }
          if (r.ok) { anyOk = true; for (var a in r.games) games[a] = r.games[a]; } else failure = failure || r;
        });
        if (!anyOk) throw failure || { kind: "offline", error: "Couldn't reach the server" };
        var total = 0, changed = [];
        files.forEach(function (f) {
          var names = games[String(map[f].appid)];
          if (!names) return;
          var n = mergeInto(map[f], names);
          if (n) { total += n; changed.push(f); markStale(f); }
        });
        var now = Date.now();
        set(LAST, String(now));
        emit({ state: "ok", time: now, added: total, error: "", kind: "" });
        window.dispatchEvent(new CustomEvent("steam-synced", { detail: { added: total, files: changed } }));
        if (total && manual) toast("Synced " + plural(total) + " from Steam");
      });
    }).catch(function (e) {
      emit({ state: "error", error: (e && e.error) || "Steam sync failed", kind: (e && e.kind) || "other" });
    }).then(function () { busy = null; });
    return busy;
  }

  window.SteamSync = { status: status, syncNow: function () { return homeSync(true); } };

  function start() {
    var pending = sget(TOAST);
    if (pending) { sdel(TOAST); toast(pending); }
    if (HOME) { homeSync(false); return; }
    loadMap().then(function (map) { if (map) pageSync(map); }).catch(function () {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
