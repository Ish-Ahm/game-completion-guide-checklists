/* Cross-device progress sync (talks to /api/sync, a Cloudflare Pages Function backed by KV).
   Syncs every localStorage key ending in -v<number> (all the checklists, plus hub-progress-v1).
   Does nothing until a passcode has been entered on the home page. */
(function () {
  "use strict";
  if (window.top !== window || window.__checklistSync) return; // not inside iframes, only once per page
  window.__checklistSync = true;

  var API = "/api/sync", PASS = "sync-pass-v1", STATE = "sync-state-v1", PROG = "hub-progress-v1";
  var HOME = !!window.SYNC_HOME;
  var busy = null;
  var status = { state: "idle", time: 0, error: "" };

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } }
  function parse(v) { try { var o = JSON.parse(v); return o && typeof o === "object" && !Array.isArray(o) ? o : null; } catch (e) { return null; } }
  function tracked(k) { return /-v\d+$/.test(k) && k.indexOf("sync-") !== 0; }
  function trackedKeys() {
    var out = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (tracked(k)) out.push(k); } } catch (e) {}
    return out;
  }
  // State: last = what each key looked like at the last successful sync; dirty = when we first noticed a local change
  function loadState() { var s = parse(get(STATE)) || {}; s.last = s.last || {}; s.dirty = s.dirty || {}; return s; }
  function saveState(s) { set(STATE, JSON.stringify(s)); }
  function emit(s) {
    for (var k in s) status[k] = s[k];
    window.dispatchEvent(new CustomEvent("sync-status", { detail: status }));
  }

  // First sync on a device where both sides already have progress: keep everything ticked on either side
  function union(a, b) {
    var x = parse(a), y = parse(b); if (!x || !y) return null;
    var out = Object.assign({}, y, x);
    if (x.got || y.got) out.got = Object.assign({}, y.got || {}, x.got || {});
    else {
      for (var k in x) if (x[k] !== true) return null;
      for (var j in y) if (y[j] !== true) return null;
    }
    return JSON.stringify(out);
  }
  // Home-page progress cache: per game, keep whichever entry is newer
  function mergeProg(a, b) {
    var x = parse(a) || {}, y = parse(b) || {}, o = Object.assign({}, y);
    for (var p in x) if (!o[p] || (x[p].t || 0) > (o[p].t || 0)) o[p] = x[p];
    return JSON.stringify(o);
  }

  function api(keys, keepalive) {
    return fetch(API, {
      method: "POST", cache: "no-store", keepalive: !!keepalive,
      headers: { "Authorization": "Bearer " + get(PASS), "Content-Type": "application/json" },
      body: JSON.stringify({ keys: keys || {} })
    }).then(function (res) {
      if (res.status === 401) { var e = new Error("Wrong passcode"); e.code = 401; throw e; }
      if (res.status === 429) throw new Error("Too many wrong passcodes, try later");
      if (!res.ok) throw new Error("Sync error " + res.status);
      return res.json();
    });
  }

  function scan(st) {
    var now = Date.now();
    trackedKeys().forEach(function (k) {
      if (k === PROG) return;
      var lv = get(k), last = st.last[k];
      if (!last) return;
      if (lv !== null && lv !== last.v) { if (!st.dirty[k]) st.dirty[k] = now; }
      else delete st.dirty[k];
    });
  }

  function pushKeys(st, send, keepalive) {
    if (!Object.keys(send).length) { saveState(st); return Promise.resolve(); }
    return api(send, keepalive).then(function (res) {
      (res.accepted || []).forEach(function (k) { st.last[k] = { v: send[k].v, t: send[k].t }; delete st.dirty[k]; });
      saveState(st);
    });
  }

  // Quick push of local changes only (used every few seconds, and when the page is hidden)
  function pushChanges(keepalive) {
    var st = loadState(); scan(st);
    var send = {};
    Object.keys(st.dirty).forEach(function (k) { var v = get(k); if (v !== null) send[k] = { v: v, t: st.dirty[k] }; });
    if (!Object.keys(send).length) { saveState(st); return Promise.resolve(); }
    return pushKeys(st, send, keepalive);
  }

  function canReload() {
    try {
      var t = +sessionStorage.getItem("sync-reload-t") || 0;
      if (Date.now() - t < 15000) return false;
      sessionStorage.setItem("sync-reload-t", String(Date.now()));
      return true;
    } catch (e) { return false; }
  }

  // Full sync: pull everything, reconcile with local data, push whatever is newer here
  function sync() {
    if (!get(PASS)) { emit({ state: "off" }); return Promise.resolve(false); }
    if (busy) return busy;
    emit({ state: "syncing", error: "" });
    busy = api({}).then(function (res) {
      var st = loadState(), r = res.keys || {}, now = Date.now(), send = {}, pulled = false;
      scan(st);
      var names = {};
      trackedKeys().forEach(function (k) { names[k] = 1; });
      Object.keys(r).forEach(function (k) { names[k] = 1; });
      Object.keys(names).forEach(function (k) {
        var lv = get(k), rm = r[k], last = st.last[k];
        function take() {
          if (set(k, rm.v)) { st.last[k] = { v: rm.v, t: rm.t }; delete st.dirty[k]; pulled = true; }
        }
        if (k === PROG) {
          var mp = mergeProg(lv, rm && rm.v);
          if (mp !== lv && !(lv === null && mp === "{}")) set(k, mp);
          if (rm && mp === rm.v) st.last[k] = { v: mp, t: rm.t };
          else if (mp !== "{}") send[k] = { v: mp, t: now };
          return;
        }
        if (!rm) { if (lv !== null) send[k] = { v: lv, t: st.dirty[k] || now }; return; }
        if (lv === rm.v) { st.last[k] = { v: lv, t: rm.t }; delete st.dirty[k]; return; }
        if (lv === null) { take(); return; }
        if (!last) { // first sync on this device and both sides differ
          var m = union(lv, rm.v);
          if (m === null) { take(); return; }
          if (m !== lv) { set(k, m); pulled = true; }
          send[k] = { v: m, t: now };
          return;
        }
        var localChanged = lv !== last.v, remoteChanged = rm.t > last.t, mine = st.dirty[k] || now;
        if (!localChanged) take();
        else if (!remoteChanged || mine > rm.t) send[k] = { v: lv, t: mine };
        else take();
      });
      return pushKeys(st, send).then(function () { return pulled; });
    }).then(function (pulled) {
      busy = null;
      emit({ state: "ok", time: Date.now(), error: "" });
      window.dispatchEvent(new CustomEvent("sync-updated", { detail: { pulled: pulled } }));
      // A checklist page already read its data when it loaded, so reload it to show what was pulled
      if (pulled && !HOME && canReload()) location.reload();
      return pulled;
    }).catch(function (e) {
      busy = null;
      if (e && e.code === 401) { try { localStorage.removeItem(PASS); } catch (x) {} emit({ state: "bad", error: "Wrong passcode" }); }
      else emit({ state: "error", error: (e && e.message) || "Offline" });
      return false;
    });
    return busy;
  }

  window.Sync = {
    status: status,
    hasPass: function () { return !!get(PASS); },
    setPasscode: function (p) { set(PASS, String(p || "").trim()); emit({ state: "idle", error: "" }); return sync(); },
    clearPasscode: function () { try { localStorage.removeItem(PASS); } catch (e) {} emit({ state: "off", error: "" }); },
    sync: sync
  };

  function start() {
    emit({ state: get(PASS) ? "idle" : "off" });
    sync();
    setInterval(function () {
      if (document.visibilityState === "visible" && !busy && get(PASS)) pushChanges(false).catch(function () {});
    }, 4000);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") sync();
      else if (get(PASS) && !busy) pushChanges(true).catch(function () {});
    });
    addEventListener("pagehide", function () { if (get(PASS) && !busy) pushChanges(true).catch(function () {}); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
