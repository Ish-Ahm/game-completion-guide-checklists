# Images

One folder per image type. Every file in `cards/`, `logos/` and `banners/` is named after the checklist's slug (its file name without `.html`), e.g. `re4.webp` for `checklists/re4.html`. All WebP, quality about 80.

| Folder | Size | Used by | Required |
|---|---|---|---|
| `cards/` | 920 x 430 px (92:43, the Steam capsule ratio), under 80 KB | Home page card. Plain horizontal artwork with the title in the picture; the site adds no logo on top. Loaded by the site, so list it in the `GAMES` entry (`art`) and in `FILES` in `sw.js`. | Yes (no file = text-only card) |
| `logos/` | about 800 px wide, transparent | The game's logo inside its own checklist page. Newer guides load it by path (`../img/logos/<slug>.webp`) and show the text title if missing; older guides embed it as base64, so for them this is only the source copy. | Optional |
| `banners/` | 3840 x 1240 px (96:31, the Steam page-background ratio). If the file is over 200 KB, export it smaller, e.g. 1920 x 620 | Background banner at the top of its checklist page. Newer guides load it by path (`../img/banners/<slug>.webp`); older ones embed it as base64 and this is the source copy. | Optional |
| `guides/<slug>/` | WebP quality 85. Screenshots at source resolution up to 1920 px wide, card or item art about 128 px wide. Size is not a concern | The guide's own pictures (maps, bosses, collectibles, items), one folder per guide. Referenced by the guide's `IMGS` map as `../img/guides/<slug>/<file>.webp`. Cached by `sw.js` the first time they load, so they need no `FILES` entry. | Newer guides (MGS2 first) |

**Naming in `guides/<slug>/`:** `<slug>-<group>-<subject>.webp`, lowercase, hyphens only, no spaces, e.g. `mgs2-boss-olga-gap.webp`, `mgs2-weapon-m9.webp`, `mgs2-box-3.webp`. Groups used so far: `menu`, `boss`, `story`, `ach`, `weapon`, `box`, `tag`, `map`, `item`. Keep names spoiler-free.

Older checklists may have no logo or banner file here; only the card is needed for the home page.

Tips: keep the subject centred in cards (they crop with `object-fit: cover`; `pos: "center 30%"` in `GAMES` moves the crop). Do not commit anything over 200 KB in `cards/`, `logos/` or `banners/` (`guides/<slug>/` is exempt: file size is not a concern there).

Which guides use banners and logos (as of now): RE4, GTA IV, Persona 4 Golden, Halo MCC, Devil May Cry and Sunset Overdrive have a banner and a logo in their header. Vanquish and Stick of Truth have neither slot, so their `banners/` and `logos/` files are not used by the site. When swapping a banner into a guide, resize it to about 1600 px wide (WebP, quality about 62, roughly 50 to 100 KB) and a logo to about 800 px wide before embedding.

## Icons

`icons/steam-trophy.svg` is the trophy shown on a home card when a game reaches 100%. It is a normal standalone file (canvas 600 x 700) that you can edit in Inkscape or any editor. After saving a change, bump `CACHE` in `sw.js` (for example `checklists-v1.3.0` to `checklists-v1.3.1`) and push, otherwise devices keep showing the old cached copy. Keep the `viewBox` on the `<svg>` line, it is what lets the icon scale. The size, position and drop shadow are set in the `.trophy` rules in `index.html`.
