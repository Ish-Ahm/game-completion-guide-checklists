# My Checklists: project guide for Claude

## What this is
A static site of interactive game achievement checklists, hosted on **Cloudflare Pages** via Git integration (every push to `main` deploys automatically, no build step, output directory is the repo root). It is installable on Android as a PWA. All progress lives in the browser's localStorage; there is no backend.

## Files
- `index.html`: home page. A `GAMES` array at the top of its script defines one card per game (file, title, localStorage key, optional `art`/`logo`/`pos`/`bar`/`cls`). Cards show progress, and the page has **Back up all** / **Restore all** (JSON with `{ app: "my-checklists", version: 1, exported, data: { key: string } }`).
- Checklists: `re4.html`, `gta4.html`, `p4g.html`, `halo-mcc.html`, `vanquish.html`, `dmc1.html`, `sunset-overdrive.html`, `sot-missables.html`, `sot-collection.html`.
- `stick-of-truth.html`: a small hand-written wrapper with two tabs (Missables, Collection) that loads `sot-missables.html` and `sot-collection.html` in iframes. Last tab is remembered in localStorage `sot-hub-tab`.
- `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, `img/` (WebP images in `cards/`, `logos/`, `banners/`, plus `icons/steam-trophy.svg` shown on cards at 100%; see `img/README.md`).

## Rules for the checklist files
- **Treat each checklist as an opaque, finished file.** They are large single-file pages (inline CSS/JS, base64 images; `re4.html` is about 5 MB). Do not read them in full, reformat or rewrite them.
- Make any change to them with a script (Python with `-I`, or sed) or a targeted grep. Never load their whole contents into the conversation.
- Each checklist has two injected blocks, marked `<!-- hub:head -->…<!-- /hub:head -->` before `</head>` and `<!-- hub:body -->…<!-- /hub:body -->` before `</body>`. They add the manifest link, the tab icon (`<link rel="icon" href="../icon-192.png">` plus `apple-touch-icon`, so every guide shows the same favicon as the home page), a theme-color meta (if missing), service worker registration, the fixed "← All games" pill (bottom-left, auto-lifted above fixed bottom bars such as RE4's phone tab bar; only shown when not inside an iframe), and a script that copies the page's own "x / N unlocked|done|collectibles" readout into localStorage `hub-progress-v1` for the home page. To change these, edit the blocks in every file by script so they stay identical.

## localStorage keys
| File | Key |
|---|---|
| re4.html | `re4-remake-checklist-v1` |
| gta4.html | `gta4-complete-checklist-v1` |
| p4g.html | `p4g-checklist-v1` |
| halo-mcc.html | `mcc-tracker-v1` |
| vanquish.html | `vanquish-checklist-v1` |
| dmc1.html | `dmc1-checklist-v1` |
| sunset-overdrive.html | `so-checklist-v1` |
| sot-missables.html | `sot-missables-v1` (flat `{ id: true }`) |
| sot-collection.html | `sot-collection-v1` (+ `sot-collection-v1-tab`) |
| hub (home page cache) | `hub-progress-v1`, `sot-hub-tab` |

Most checklists store `{ got: { id: true }, ... }`. GTA IV, RE4 and Halo seed some unlocks by default, so the home page relies on `hub-progress-v1` rather than counting `got`.

## Sync
`sync.js` (loaded by `index.html` and by each checklist through the hub:body block) syncs every localStorage key ending in `-v<number>` to Cloudflare KV via the Pages Function `functions/api/sync.js` (needs KV binding `SYNC_KV` and secret `SYNC_PASSCODE`; see `SYNC-SETUP.md`). New checklists must keep the `<slug>-checklist-v1` key form to be picked up. `sw.js` never caches `/api/`.

## Adding a new checklist
Preferred: put the file in `checklists/` (short lowercase name, e.g. `newgame.html`), add its card image at `img/cards/newgame.webp` (920x430), then run from the project root:
`python3 -I tools/add_guide.py checklists/newgame.html --title "New Game" --bar "#ff8800" [--pos "center 30%"] [--dry-run]`
It checks the storage key and readout, injects or refreshes the hub blocks (copied from `vanquish.html`), adds the `GAMES` entry, adds the card to `FILES` in `sw.js` and bumps `CACHE`. Safe to re-run (for example after adding the card image later). Use `--dry-run` first to see the report. Multi-part guides like Stick of Truth are not supported by the script; add those by hand.
Manual route (if the script cannot be used):
1. Copy the file into `checklists/`.
2. Inject the two hub blocks by script, copying them from an existing checklist (e.g. `vanquish.html`).
3. Find its key with one grep: `grep -o 'const KEY = "[^"]*"' newgame.html`.
4. Add an entry to `GAMES` in `index.html`.
5. Add the card image to `FILES` in `sw.js`, and bump `CACHE`.

## Every change: bump the service worker cache
Increment `CACHE` in `sw.js` (`checklists-v1` → `checklists-v2` …) on **every** commit that changes any file, or installed phones keep serving old copies.

## Testing
Serve locally (`python -m http.server 8765`) and use headless Chromium (Playwright) at 400px and 1200px: no JS errors, the "All games" pill is not covered by and does not overlap sticky/fixed bars, the home page shows progress after ticking an item, Back up all / Restore all round-trips, and `index.html` has no sideways scrolling at 360px. Google Fonts requests may fail in sandboxes; that is fine.

## Owner's preferences
- British English spelling; never use em dashes.
- Responses: emoji section headings, `---` between major sections, bullet points, short explanations.
- Commands for **EndeavourOS (Arch-based, GNOME)**: `pacman` / `yay`.
- Keep token use low: scripts and targeted greps over reading big files.
