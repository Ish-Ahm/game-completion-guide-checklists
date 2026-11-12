// Cloudflare Pages Function: GET /api/steam?appids=2050650,12210
// Returns the achievements the owner has unlocked on Steam, so the checklists can tick them.
// Needs the secret STEAM_API_KEY and the variable STEAM_ID (Pages dashboard, or .dev.vars locally).
//
// Success: { ok: true, fetched: "<ISO time>", games: { "<appid>": ["APINAME", ...] }, errors?: { "<appid>": "..." } }
// Failure: { ok: false, error: "..." }
// The key never leaves the server and is never put in a response or an error message.

const MAX_APPIDS = 10;
const CACHE_SECONDS = 120;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

// Fetches one game's unlocked achievements. Returns { names } or { error, status }.
async function fetchGame(appid, env, ctx) {
  // The cache key is only a label (it is never fetched) and holds no secret
  const cacheKey = new Request(`https://steam-cache.invalid/ach/${env.STEAM_ID}/${appid}`);
  const cache = typeof caches !== "undefined" ? caches.default : null;
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) { try { return await hit.json(); } catch (e) { /* ignore a bad cache entry */ } }
  }

  const url = "https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?" +
    new URLSearchParams({ key: env.STEAM_API_KEY, steamid: env.STEAM_ID, appid, format: "json" });
  let res, data;
  try {
    res = await fetch(url, { headers: { "User-Agent": "my-checklists" } });
    data = await res.json().catch(() => null);
  } catch (e) {
    return { error: "Steam is not reachable right now. Try again later.", status: 502 };
  }

  const ps = data && data.playerstats;
  if (ps && ps.success === false) {
    const msg = String(ps.error || "");
    if (/not public|private/i.test(msg)) return { error: "Profile or game details are private", status: 403 };
    return { error: msg ? "Steam: " + msg : "Steam could not return this game's achievements", status: 400 };
  }
  if (res.status === 403) return { error: "Profile or game details are private", status: 403 };
  if (!res.ok || !ps || !Array.isArray(ps.achievements)) {
    return { error: res.status >= 500 ? "Steam is having problems right now. Try again later." : "Steam returned an unexpected answer", status: res.status >= 500 ? 502 : 400 };
  }

  const out = { names: ps.achievements.filter(a => a && a.achieved === 1).map(a => a.apiname) };
  if (cache) {
    const put = cache.put(cacheKey, new Response(JSON.stringify(out), {
      headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${CACHE_SECONDS}` },
    }));
    if (ctx && ctx.waitUntil) ctx.waitUntil(put.catch(() => {})); else await put.catch(() => {});
  }
  return out;
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!env.STEAM_API_KEY || !env.STEAM_ID) {
    return json({ ok: false, error: "Steam sync is not set up on the server (missing STEAM_API_KEY or STEAM_ID)." }, 503);
  }

  const raw = new URL(request.url).searchParams.get("appids") || "";
  const appids = [...new Set(raw.split(",").map(s => s.trim()).filter(Boolean))];
  if (!appids.length) return json({ ok: false, error: "Add ?appids=123,456" }, 400);
  if (appids.length > MAX_APPIDS) return json({ ok: false, error: `At most ${MAX_APPIDS} appids per request.` }, 400);
  if (!appids.every(a => /^\d{1,10}$/.test(a))) return json({ ok: false, error: "appids must be numbers." }, 400);

  const results = await Promise.all(appids.map(a => fetchGame(a, env, context)));
  const games = {}, errors = {};
  let status = 200;
  appids.forEach((a, i) => {
    const r = results[i];
    if (r.error) { errors[a] = r.error; status = status === 200 ? r.status : status; } else games[a] = r.names;
  });

  if (!Object.keys(games).length) {
    return json({ ok: false, error: Object.values(errors)[0], errors }, status);
  }
  const body = { ok: true, fetched: new Date().toISOString(), games };
  if (Object.keys(errors).length) body.errors = errors;
  return json(body);
}

// Anything other than GET is not allowed
export const onRequest = () => json({ ok: false, error: "Use GET." }, 405);
