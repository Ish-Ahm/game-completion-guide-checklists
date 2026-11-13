// Cloudflare Pages Function: POST /api/sync
// Stores checklist progress in Workers KV so it can sync between devices.
// Needs a KV binding called SYNC_KV and a secret called SYNC_PASSCODE (see "MD files/SYNC-SETUP.md").
//
// Request:  { keys: { "<localStorage key>": { v: "<value string>", t: <ms timestamp> } } }  (keys may be empty = just read)
// Response: { keys: { ...everything stored }, accepted: [ "<keys that were saved>" ] }

const KEY_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*-v\d+$/;
const MAX_KEYS = 60;
const MAX_VALUE = 400000;
const MAX_FAILS = 8;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
}

// Compares hashes so the check does not leak how much of the passcode was right
async function samePasscode(a, b) {
  const [x, y] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

export async function onRequestPost({ request, env }) {
  if (!env.SYNC_KV || !env.SYNC_PASSCODE) return json({ error: "Sync is not set up on the server yet." }, 503);

  // Slow down guessing: after 8 wrong passcodes from one address, refuse for 10 minutes
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const failKey = "fail:" + ip;
  const fails = parseInt((await env.SYNC_KV.get(failKey)) || "0", 10);
  if (fails >= MAX_FAILS) return json({ error: "Too many wrong passcodes. Try again in 10 minutes." }, 429);

  const given = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (!(await samePasscode(given, env.SYNC_PASSCODE))) {
    await env.SYNC_KV.put(failKey, String(fails + 1), { expirationTtl: 600 });
    await new Promise(r => setTimeout(r, 400));
    return json({ error: "Wrong passcode." }, 401);
  }

  let incoming;
  try { incoming = (await request.json()).keys || {}; } catch (e) { return json({ error: "Bad request." }, 400); }
  const names = Object.keys(incoming);
  if (names.length > MAX_KEYS) return json({ error: "Too many keys." }, 400);

  const doc = JSON.parse((await env.SYNC_KV.get("progress")) || '{"keys":{}}');
  const accepted = [];
  for (const k of names) {
    const item = incoming[k];
    if (!KEY_RE.test(k) || !item || typeof item.v !== "string" || item.v.length > MAX_VALUE || !Number.isFinite(item.t)) continue;
    const cur = doc.keys[k];
    // Newest change wins
    if (!cur || item.t >= cur.t) { doc.keys[k] = { v: item.v, t: item.t }; accepted.push(k); }
  }
  if (accepted.length) await env.SYNC_KV.put("progress", JSON.stringify(doc));
  return json({ keys: doc.keys, accepted });
}

// Anything other than POST is not allowed
export const onRequest = () => json({ error: "Use POST." }, 405);
