#!/usr/bin/env python3
"""Build steam-map.json: which Steam achievement (apiname) ticks which checklist item.

Run from the project root (needs STEAM_API_KEY and STEAM_ID in .dev.vars, which is git-ignored):
  python3 -I tools/build_steam_map.py            # rebuild, keeping hand edits (see below), print a short report
  python3 -I tools/build_steam_map.py --only re4.html

Reads each checklist by script (never print or open them by hand), asks Steam for the owned-games list
and each game's achievement schema, and matches on normalised names.

Hand fixes: put them in tools/steam-map-overrides.json, as
  { "re4.html": { "STEAM_APINAME": "checklistItemId", "OTHER_APINAME": null } }
An override wins over the automatic match; null removes a match. They survive every rebuild.

To add a game: add one entry to GAMES below (file, appid, extractor), run this script, then fix the
unmatched names in the overrides file.
"""
import argparse, json, re, sys, unicodedata, urllib.error, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "steam-map.json"
OVERRIDES = ROOT / "tools" / "steam-map-overrides.json"

# file -> appid, extractor kind, expected name (for the owned-games check)
GAMES = {
    "re4.html":              {"appid": 2050650, "kind": "sections", "name": "Resident Evil 4 (2023)"},
    "gta4.html":             {"appid": 12210,   "kind": "sections", "name": "Grand Theft Auto IV: The Complete Edition"},
    "p4g.html":              {"appid": 1113000, "kind": "sections", "name": "Persona 4 Golden"},
    "halo-mcc.html":         {"appid": 976730,  "kind": "halo",     "name": "Halo: The Master Chief Collection"},
    "vanquish.html":         {"appid": 460810,  "kind": "sections", "name": "Vanquish"},
    "dmc1.html":             {"appid": 631510,  "kind": "sections", "name": "Devil May Cry HD Collection (DMC1 only)"},
    "sunset-overdrive.html": {"appid": 847370,  "kind": "sections", "name": "Sunset Overdrive"},
    "sot-missables.html":    {"appid": 213670,  "kind": "sections", "name": "South Park: The Stick of Truth"},
    "re7.html":              {"appid": 418370,  "kind": "sections", "name": "Resident Evil 7 Biohazard"},
}
FLAT = {"sot-missables.html"}  # these store { id: true } instead of { got: { id: true } }


def read_env():
    env = {}
    p = ROOT / ".dev.vars"
    if not p.is_file():
        sys.exit("error: .dev.vars not found. Create it yourself with STEAM_API_KEY=... and STEAM_ID=... (it is git-ignored).")
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    for k in ("STEAM_API_KEY", "STEAM_ID"):
        if not env.get(k):
            sys.exit(f"error: {k} is missing in .dev.vars")
    return env


def steam_get(path, params):
    """GET from the Steam Web API. Errors never include the URL, so the key cannot leak."""
    url = "https://api.steampowered.com/" + path + "?" + urllib.parse.urlencode(params)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "my-checklists-map-builder"})
        with urllib.request.urlopen(req, timeout=40) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        sys.exit(f"error: Steam answered HTTP {e.code} for {path}")
    except Exception as e:
        sys.exit(f"error: could not reach Steam for {path} ({type(e).__name__})")


def norm(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c)).lower()
    s = s.replace("&", " and ").replace("’", "'")
    s = re.sub(r"[^a-z0-9 ]+", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r"^the ", "", s)
    return s


def unescape(raw):
    try:
        return json.loads('"' + raw + '"')
    except Exception:
        return raw


def checklist_items(file, kind):
    """Return [(id, name, description)] pulled from the checklist's data by regex."""
    text = (ROOT / "checklists" / file).read_text(encoding="utf-8")
    text = re.sub(r"base64,[A-Za-z0-9+/=]{40,}", "base64,", text)
    items, seen = [], set()
    if kind == "halo":
        i = text.index("const DATA = [")
        j = text.index("];", i)
        for m in re.finditer(r'\[(\d+),"((?:[^"\\]|\\.)*)","((?:[^"\\]|\\.)*)"', text[i:j]):
            if m.group(1) not in seen:
                seen.add(m.group(1)); items.append((m.group(1), unescape(m.group(2)), unescape(m.group(3))))
        return items
    pat = re.compile(r'\bid:\s*"([^"]+)"\s*,\s*name:\s*"((?:[^"\\]|\\.)*)"(?:[^{}]{0,120}?\bdesc:\s*"((?:[^"\\]|\\.)*)")?')
    for m in pat.finditer(text):
        tail = text[m.end():m.end() + 400]
        # achievements carry a description; skip run/collectible rows that do not look like achievements
        if file not in FLAT and "pct:" not in tail.split("guide:")[0]:
            continue
        if m.group(1) not in seen:
            seen.add(m.group(1)); items.append((m.group(1), unescape(m.group(2)), unescape(m.group(3) or "")))
    return items


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--only", help="rebuild just this file, e.g. re4.html")
    args = ap.parse_args()
    env = read_env()
    keyp = {"key": env["STEAM_API_KEY"]}

    keys = {}  # file -> localStorage key
    for f in GAMES:
        t = (ROOT / "checklists" / f).read_text(encoding="utf-8")
        m = re.search(r'const KEY\s*=\s*"([^"]+)"', t)
        if not m:
            sys.exit(f"error: no KEY found in {f}")
        keys[f] = m.group(1)

    owned = steam_get("IPlayerService/GetOwnedGames/v1/", {**keyp, "steamid": env["STEAM_ID"], "include_appinfo": 1, "format": "json"})
    games = (owned.get("response") or {}).get("games")
    if not games:
        sys.exit("error: Steam returned no owned games. Is the profile's Game details set to Public?")
    owned_by_id = {g["appid"]: g.get("name", "") for g in games}
    print(f"Owned games found: {len(owned_by_id)}")
    for f, g in GAMES.items():
        n = owned_by_id.get(g["appid"])
        print(f"  {g['appid']:>8}  {'owned: ' + n if n else 'NOT in your owned list'}  <- {f}")

    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8")) if OVERRIDES.is_file() else {}
    result = json.loads(OUT.read_text(encoding="utf-8")) if (args.only and OUT.is_file()) else {}

    for f, g in GAMES.items():
        if args.only and f != args.only:
            continue
        schema = steam_get("ISteamUserStats/GetSchemaForGame/v2/", {**keyp, "appid": g["appid"], "l": "english"})
        ach = ((schema.get("game") or {}).get("availableGameStats") or {}).get("achievements") or []
        items = checklist_items(f, g["kind"])
        by_norm = {}
        for a in ach:
            by_norm.setdefault(norm(a.get("displayName", "")), []).append(a)
        mapping, used_steam, used_items, ambiguous = {}, set(), set(), []
        for iid, name, desc in items:
            hits = by_norm.get(norm(name), [])
            if len(hits) > 1 and desc:
                # same title twice on Steam: tell them apart by the description
                narrowed = [a for a in hits if norm(desc) and norm(desc) in norm(a.get("description", ""))]
                if len(narrowed) == 1:
                    hits = narrowed
            if len(hits) == 1 and hits[0]["name"] not in used_steam:
                mapping[hits[0]["name"]] = iid; used_steam.add(hits[0]["name"]); used_items.add(iid)
            elif len(hits) > 1 or (hits and hits[0]["name"] in used_steam):
                ambiguous.append(name)
        ids = {i for i, _, _ in items}
        for api, iid in (overrides.get(f) or {}).items():
            if iid is None:
                mapping.pop(api, None)
            else:
                mapping[api] = iid
                if iid not in ids:
                    print(f"  ! override in {f}: item id {iid!r} is not in the checklist")
        used_items = set(mapping.values())
        used_steam = set(mapping.keys())
        result[f] = {"appid": g["appid"], "key": keys[f], "shape": "flat" if f in FLAT else "got", "map": dict(sorted(mapping.items()))}

        un_items = [n for i, n, _ in items if i not in used_items]
        un_steam = [a.get("displayName", a["name"]) for a in ach if a["name"] not in used_steam]
        print(f"\n{f}: matched {len(mapping)} / checklist {len(items)}  (Steam lists {len(ach)})")
        if not ach:
            print("  ! Steam returned no achievement schema for this appid")
        if un_items:
            print(f"  unmatched checklist ({len(un_items)}): " + "; ".join(un_items[:12]) + (" ..." if len(un_items) > 12 else ""))
        if un_steam:
            note = " (expected: other games in the collection)" if f in ("dmc1.html", "halo-mcc.html") else ""
            print(f"  unmatched Steam ({len(un_steam)}){note}: " + "; ".join(un_steam[:12]) + (" ..." if len(un_steam) > 12 else ""))
        if ambiguous:
            print("  ambiguous names (same title on Steam twice, fix in overrides): " + "; ".join(ambiguous[:8]))

    OUT.write_text(json.dumps(result, indent=1, ensure_ascii=False, sort_keys=True) + "\n", encoding="utf-8")
    print(f"\nWrote {OUT.name}")


if __name__ == "__main__":
    main()
