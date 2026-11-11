# Images

One folder per image type. Every file is named after the checklist's slug (its file name without `.html`), e.g. `re4.webp` for `checklists/re4.html`. All WebP, quality about 80.

| Folder | Size | Used by | Required |
|---|---|---|---|
| `cards/` | 920 x 430 px (92:43, the Steam capsule ratio), under 80 KB | Home page card. Plain horizontal artwork with the title in the picture; the site adds no logo on top. Loaded by the site, so list it in the `GAMES` entry (`art`) and in `FILES` in `sw.js`. | Yes (no file = text-only card) |
| `logos/` | about 800 px wide, transparent | The game's logo inside its own checklist page. Embedded in the HTML as base64 by Claude, so this folder is only the source copy. | Optional |
| `banners/` | 3840 x 1240 px (96:31, the Steam page-background ratio). If the file is over 200 KB, export it smaller, e.g. 1920 x 620 | Background banner at the top of its checklist page. Embedded in the HTML as base64, so this is the source copy. | Optional |

Older checklists may have no logo or banner file here; only the card is needed for the home page.

Tips: keep the subject centred in cards (they crop with `object-fit: cover`; `pos: "center 30%"` in `GAMES` moves the crop). Do not commit anything over 200 KB.

Which guides use banners and logos (as of now): RE4, GTA IV, Persona 4 Golden, Halo MCC, Devil May Cry and Sunset Overdrive have a banner and a logo in their header. Vanquish and Stick of Truth have neither slot, so their `banners/` and `logos/` files are not used by the site. Note the Devil May Cry images are named `dmc1` while its guide file is `dmc.html`. When swapping a banner into a guide, resize it to about 1600 px wide (WebP, quality about 62, roughly 50 to 100 KB) and a logo to about 800 px wide before embedding.
