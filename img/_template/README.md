# Image folder template for a new game

Copy this folder to `img/<slug>/` (slug = the checklist's file name without `.html`, e.g. `img/re4/`).

| File | Size | Used by | Required |
|---|---|---|---|
| `card.webp` | 1200 x 560 px, WebP, under 80 KB | Home page card. Plain horizontal artwork; the game's title should already be in the picture. No logo is overlaid by the site. | Yes (without it the card falls back to a text-only card) |
| `logo.webp` | about 800 px wide, transparent WebP | Inside the checklist page's own header. Embedded into the HTML as base64 by Claude, so it is **not** loaded from this folder. Keep it here as the source file. | Optional |
| `banner.webp` | 1920 x 600 px, WebP | Background of the checklist page's header. Embedded as base64 too. Keep here as the source file. | Optional |

Notes:
- Home page loads only `img/<slug>/card.webp`. Add it to `FILES` in `sw.js` if you want it available offline straight away.
- Keep the subject of the artwork in the centre. The card crops with `object-fit: cover`, and `pos: "center 30%"` in the `GAMES` entry moves the crop up or down.
- Use WebP, quality about 80. Do not commit anything over 200 KB.
