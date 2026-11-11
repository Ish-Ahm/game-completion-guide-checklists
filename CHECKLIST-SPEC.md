# Spec for new checklist files (give this to the Claude project that builds them)

The site is static. A checklist is **one self-contained HTML file** (inline CSS and JS, images as base64) in `checklists/`. Follow the RE4 style: search box, Achievements / Playthroughs / 100% Guide tabs, completion bar.

## Must have
1. **File name**: lowercase slug, e.g. `newgame.html`. Delivered as a single file, no external local files (Google Fonts links are fine).
2. **Storage key**: one line in the script, exactly in this form:
   `const KEY = "<slug>-checklist-v1";`
   Progress is saved to `localStorage[KEY]` as `{ "got": { "<achievement-id>": true } }` (plus any other fields you need). Anything already unlocked from the Steam/PSN PDF is pre-ticked by default.
3. **Visible progress readout** containing text like `7 / 46 unlocked` (also accepted: `done`, `collectibles`). The home page copies this number. It must stay in the page and update when items are ticked.
4. `<meta name="viewport" content="width=device-width, initial-scale=1">` and a `<meta name="theme-color">`.
5. Work at 360 px wide with no sideways page scroll.

## Must not have
- Do **not** add the `<!-- hub:head -->` / `<!-- hub:body -->` blocks, the manifest link, a service worker, or any "back to home" button. They are injected afterwards by script.
- No fixed element in the bottom-left corner (the "← All games" pill sits there). A fixed bottom bar is fine, the pill lifts above it.
- No absolute links to other pages of the site.

## Images
See `img/_template/README.md`. Provide `card.webp` (home page), and optionally `logo.webp` and `banner.webp` for the page header (embedded in the HTML).

## Hand-over checklist (Claude should output this at the end)
- File name: `<slug>.html`
- KEY: `<slug>-checklist-v1`
- Total achievements, and how many pre-ticked
- Card image: `img/<slug>/card.webp`, suggested `pos` value
- Suggested `bar` colour (hex) for the home-page progress bar
