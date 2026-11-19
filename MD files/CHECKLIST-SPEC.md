# New guides: spec and how to add them to the site
 
Two parts. **Part 1** is for the Claude project that builds the guide (upload this file to it as a knowledge file). **Part 2** is for you: what to do with the file once Claude has made it.
 
---
 
## Part 1: spec for the Claude project
 
The site is static. A guide is **one self-contained HTML file** (inline CSS and JS, images as base64). **Follow `GUIDE-STYLE.md` exactly**: it is the RE4 design (header with centred logo, sticky search and tabs, completion panel, Achievements / Playthroughs / 100% Guide tabs) with the full CSS and page engine. Only the colour palette, part colours and content change per game, and the colours must match the game, not RE4.
 
### Must have
1. **File name**: lowercase slug with letters, numbers and hyphens, e.g. `newgame.html`. One file, no external local files (Google Fonts links are fine).
2. **Storage key**: one line in the script, exactly in this form:
   `const KEY = "<slug>-checklist-v1";`
   The key must end in `-v1`, or cross-device sync ignores the guide. Progress is saved to `localStorage[KEY]` as `{ "got": { "<achievement-id>": true }, ... }` plus any other fields you need. Anything already unlocked in the Steam/PSN PDF is pre-ticked by default.
3. **Achievement data the Steam sync can read.** Each achievement is an object written in this order, on one line or several:
   `{ id: "shortid", name: "Exact Steam Name", desc: "Steam description.", pct: 12.3, ... }`
   - `id`: short, unique, stable (never rename it later, saved progress uses it).
   - `name`: **exactly as shown on Steam** (same spelling and punctuation). The Steam map is built by matching these names.
   - `desc` and `pct` must be present. If two achievements share a name, their `desc` must differ. `pct` stays in the data but is **not displayed**.
   - The total number of achievement objects must equal the number of Steam achievements for that game (DLC included). Guide-only rows (steps, collectibles, run plans) must not use the `id` then `name` then `pct` pattern.
4. **Visible progress readout** with text like `7 / 46 unlocked` (also accepted: `done`, `collectibles`). It must stay in the page and update when items are ticked. The home page copies this number, so it must be the first such text in the page.
5. `<meta name="viewport" content="width=device-width, initial-scale=0.85, viewport-fit=cover">` (0.85 is the site-wide phone scale, identical on every page) and a `<meta name="theme-color">` set to the guide's `--bg`.
6. Works at 360 px wide with no sideways page scroll.
7. **Filter row** (Achievements tab), as in GUIDE-STYLE.md: a status segment (All, To do, Unlocked, Missable), a game segment if the game has DLC, a playthrough dropdown and "Show all guides". The buttons stretch to fill the row (`flex: 1 1 auto`), with the text centred and equal padding left and right. The search box sits in the sticky top bar above the tabs.
8. **Settings toggle**: put the save and backup controls in a collapsed toggle, as in RE4:
   `<details class="settings"><summary>Save, back up and settings</summary> ... </details>`
   containing the save status text, Back up, Restore (with its hidden file input), the PlayStation / Xbox prompt toggle and the reset button. Keep filters and search outside it.
9. **Reset button** (game is on Steam): exactly
   `<button class="chip reset" id="reset" data-steam-reset>Reset to Steam data</button>`
   The site's `steam-sync.js` takes over this button, so the guide needs no reset code of its own. Do not write any Steam API code in the guide.
10. **Header with banner and logo**: a darkened banner as the header background and the logo centred on top, embedded as base64 (banner about 1600 px wide, logo about 800 px wide, WebP). The game title stays in the page for screen readers. If the images come later, leave `src=""` on `img.hero` and `img.logo`; the title then shows as text.
11. **Playthroughs**: run 1 is always a blind, standard first playthrough to enjoy the game; missables and challenges go in later runs. The 100% Guide lists collectibles and every chapter-specific achievement chapter by chapter, for the base game and each DLC.
12. **Guide images are required.** Include every image from the source guides that matters for playing: collectible locations, maps, enemy and boss pictures, puzzle solutions, item and card art, route screenshots. Leave out only decoration (trophy and achievement icons, site logos, avatars). **File size is not a concern**: never drop or shrink useful images to save space. Take them from both the saved HTML pages and the PDFs of the same guides, since HTML saves often miss lazy-loaded pictures. Details are in GUIDE-STYLE.md, section 6.
### Must not have
- Your own `<link rel="icon">` or favicon. The shared tab icon (`../icon-192.png`) is added by the injected hub block.
- The `<!-- hub:head -->` / `<!-- hub:body -->` blocks, a manifest link, a service worker, or a "back to home" button. They are injected afterwards by script.
- Any fixed element in the bottom-left corner (the "← All games" pill sits there). A fixed bottom bar is fine, the pill lifts above it.
- Absolute links to other pages of the site.
- Displayed unlock rates (Steam or PSN percentages).
- Decorative images such as trophy icons.
### Images
See `img/README.md`. Provide `cards/<slug>.webp` (920 x 430, the home page card with the title in the picture), and optionally `logos/<slug>.webp` and `banners/<slug>.webp` (3840 x 1240) for the header.
 
### Hand-over note (Claude should end with this)
- File name: `<slug>.html`
- KEY: `<slug>-checklist-v1`
- Steam appid and the number of achievements (and how many pre-ticked)
- Number of guide images included, and any the sources did not capture (which section, how many), with a request for a PDF or re-save to fill them
- Card image: `img/cards/<slug>.webp`, suggested `pos` value for the crop
- Suggested `bar` colour (hex) for the home-page progress bar (usually the guide's `--accent`)
- Anything that breaks the rules above, and why
---
 
## Part 2: what you do after Claude makes the guide
 
**Quick way:** put the files in place (steps 1 and 2), then tell Claude Code in this project: *"Add the new guide `<slug>.html`, Steam appid `<number>`, title `<name>`, bar colour `<hex>`."* It follows steps 3 to 6 and asks you for the version number. The manual steps are below.
 
1. **Save the guide** as `checklists/<slug>.html`.
2. **Save the images**: card at `img/cards/<slug>.webp` (required), and optionally `img/logos/<slug>.webp` and `img/banners/<slug>.webp`.
3. **Add it to the site** (from the project folder). Use `--dry-run` first to see the report and any warnings:
   ```
   python3 -I tools/add_guide.py checklists/<slug>.html --title "Game Title" --bar "#ff8800" --pos "center 30%" --dry-run
   python3 -I tools/add_guide.py checklists/<slug>.html --title "Game Title" --bar "#ff8800" --pos "center 30%"
   ```
   This injects the shared header and footer blocks (tab icon, "All games" pill, progress readout, sync scripts), adds the home page card, and adds the card image to the offline cache list. It is safe to re-run, for example after you add the card image later. Guides with two parts, like Stick of Truth, must be added by hand.
4. **Link it to Steam** (so achievements tick automatically):
   - Open `tools/build_steam_map.py` and add one line to `GAMES`:
     `"<slug>.html": {"appid": 123456, "kind": "sections", "name": "Game Title"},`
     (use `"kind": "halo"` only for Halo-style data rows).
   - Run: `python3 -I tools/build_steam_map.py --only <slug>.html`
   - Read the short report. It should say "matched N / checklist N". For any unmatched name, add a fix to `tools/steam-map-overrides.json`, for example `{ "<slug>.html": { "STEAM_APINAME": "itemId" } }`, and run the command again.
   - Needs `.dev.vars` (your Steam key and ID) and your Steam profile's Game details set to Public.
5. **Version number**: every change needs a new cache version in `sw.js`. Claude Code will ask you, quoting the previous number. You decide the new one (minor for a new guide, patch for a fix).
6. **Check it locally (optional)**: `npx wrangler pages dev .` and open the guide and the home page. The card should show, the guide should open, "← All games" should return, and ticking an item should move the home progress bar.
7. **Publish**:
   ```
   git add -A
   git commit -m "Add <Game Title> guide"
   git push
   ```
   Wait for the green tick on Cloudflare, then reload the site with Ctrl+Shift+R.
### If something looks wrong
- **Card says "Open" or has no art**: the card image is missing or misnamed. Fix it, then re-run step 3.
- **Progress bar never moves**: the guide has no visible `x / N unlocked` readout.
- **Not syncing between devices**: the storage key does not end in `-v1`.
- **Steam ticks nothing**: the appid is wrong, the map has unmatched names, or the Steam profile is private.
- **Looks different from the other guides**: Claude did not follow `GUIDE-STYLE.md`. Ask it to.
- **Screenshots missing**: the saved page did not capture them. Give Claude a PDF of the same guide page.
 