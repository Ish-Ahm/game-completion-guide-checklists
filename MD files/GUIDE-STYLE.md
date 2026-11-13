# Guide style template (every checklist follows this)

The **Resident Evil 4** guide (`re4.html`) is the reference design for every guide on the site. `re7.html` is the first guide built from this document. A new guide must look and behave like these two. Only three things change per game:

1. the **colour palette** (the first block of `:root` in the CSS),
2. the **part colours** (one per base game or DLC),
3. the **content** (achievements, playthroughs, 100% guide chapters).

Fonts, layout, spacing, components and behaviour stay the same. This file sits alongside `CHECKLIST-SPEC.md`, which covers the site rules (storage key, Steam data, hub blocks). Where they overlap, follow both. The full CSS and page engine are at the end of this file, so no other file is needed to rebuild the look.

---

## 1. Colours: match the game, not RE4

Red and bone white suit RE4, not every game. Take the palette from the game's own logo and key art (the person may attach images for reference only; never put reference images in the guide unless asked).

| Token | Role | RE4 | RE7 |
|---|---|---|---|
| `--bg`, `--bg-2` | page, inputs | `#0b0a09`, `#13110f` | `#0d0b07`, `#15110b` (sepia black) |
| `--card`, `--card-2` | sheets, chips | `#191614`, `#221e1b` | `#1b160f`, `#251e14` |
| `--ink`, `--ink-soft` | text, secondary text | `#ece5d8`, `#a59c8f` | `#ece3cf`, `#a8987a` (bone) |
| `--accent` | main colour: active tab, sheet tops, badges, meter | `#c4202b` (logo red) | `#e8740c` (logo "VII" orange) |
| `--accent-ink` | text on accent | `#fff` | `#170d03` (dark, orange is light) |
| `--gold` | headings inside guides, links, eyebrow | `#c9a463` | `#d9a441` (candlelight) |
| `--green` | done / ticked | `#7fc77a` | `#a3ad62` (olive, fits sepia) |
| `--warn` | missable tag, reset, errors | `#ff8a80` | `#f2876f` |
| `--c-<part>` | one per part (base game, each DLC) | red, gold | base orange, Vol. 1 `#b4452f` blood, Vol. 2 gold, End of Zoe `#8e9b55` swamp, Not a Hero `#7f9db3` steel |

Rules:
- Pick `--accent` from the logo's strongest colour. If it is light (orange, yellow, cyan), set `--accent-ink` dark so text on it stays readable.
- Keep backgrounds near-black but tinted towards the game's mood (warm sepia, cold blue and so on). Keep contrast of `--ink` on `--card` at 7:1 or better.
- Give each base game or DLC its own `--c-<key>` that can be told apart in the meter and legend. Elements carry `data-p="<key>"` and pick up the colour automatically.
- Set `<meta name="theme-color">` to `--bg`.

---

## 2. Page structure

Top to bottom, as in RE4:

1. **Header** (`<header>`, centred): darkened banner image behind (`img.hero`, `object-fit: cover`, `brightness(.38)`), logo centred (`img.logo`, max 560 px), then the **eyebrow** (`Steam · 100% checklist`, gold, spaced capitals) and a one-paragraph summary. The game title stays in the page as `h1.title`; it is visually hidden once the logo has a `src`, and shown as large condensed capitals when there is no logo yet. Banner and logo are embedded as base64 WebP.
2. **Top bar** (sticky): rounded search box with icon and clear button, a result count, then the three **tabs**: Achievements, Playthroughs, 100% Guide, each with its icon. On phones (under 700 px) the tabs become a **fixed bottom bar** with icons above labels. The "← All games" pill lifts itself above it.
3. **Completion panel**: "COMPLETION" heading, big `x / N unlocked · y%` readout (the home page reads this text), a segmented meter with one coloured segment per part, a legend, and the collapsed `<details class="settings">` with save status, Back up, Restore, the PlayStation / Xbox button-prompt toggle and `Reset to Steam data` (exact markup from CHECKLIST-SPEC rule 9).
4. **Three tab panels** (`#view-ach`, `#view-runs`, `#view-coll`).
5. **Footer**: centred, small, names the sources (Steam for names and descriptions, the trophy guides for strategy) and how many achievements were unlocked when it was made.
6. **Back-to-top** round button, bottom right.

---

## 3. Achievements tab

- **Filter row** (`.row-tools`): a status segment (All, To do, Unlocked, Missable), a game segment (All plus one button per part, short labels), a playthrough dropdown ("Any playthrough" plus every run) and a "Show all guides" chip. The segments stretch to fill the row with centred text.
- **Jump chips** (`nav.jumps`): one per category with its count, scrolling sideways on phones, left border in the part colour.
- **Category sheets** (`section.sheet`): coloured top border, small part label above a big condensed uppercase title, count on the right, one-line intro in your own words plus a "Guide source ↗" link.
- **Achievement rows** (`li.item`): large square checkbox, name, **run badges** (filled, part colour, link to the run), **tags** (outlined: Story blue, Missable warn, Collectable green, Time limited orange), description, then "Show guide" which opens an indented guide panel with a part-coloured left border.
- Group achievements into meaningful **categories** (story, first steps, chapter moments, collectables, difficulty, one sheet per DLC), not one long list.
- **Unlock rates are not shown.** Keep `pct` in the data (Steam sync needs it) but do not display it.
- Collectable achievements that depend on 100% Guide ticks show a summary line ("Files ticked in the 100% Guide: 12 / 32"), an indeterminate checkbox while partly done, and tick themselves when the last item is ticked.

## 4. Playthroughs tab

- **Run 1 is always a blind, standard first playthrough** on the normal difficulty, just to enjoy the game: no guide, no collectible hunting. Missables move to later runs.
- Then the cleanup and challenge runs, then each DLC (its own runs, in a sensible order).
- A top sheet "YOUR PLAN · PLAYTHROUGHS" with `x / N done` and a **run map**: a grid of cards (top border in the part colour) showing run label, title and `tasks · achievements` progress. Cards link to the runs.
- Each **run sheet**: small label (part · run), big title, gold mode line (`New Game · Normal`), a summary, tickable **tasks** (name plus a short detail line), **achievement chips** for that run (turn green when unlocked), optional prose, and optional collapsible reference boxes (`details.more`) for long tables such as unlockables or card lists.

## 5. 100% Guide tab

- A top sheet with the total count, a kind filter segment (All, Achievements, Files and so on) and "Hide ticked".
- One collapsible **chapter** (`details.chapter`) per area or chapter, in story order, then one per DLC mode. The summary shows the title, `got / total` and per-kind counts; the left border turns green when complete.
- Inside: **"Achievements here"** (every chapter-specific or story achievement that happens in that chapter, ticking the real achievement, with a one-line tip in your own words and an "Open its guide ›" link), then the **collectibles** in walkthrough order with a kind tag, title, location and description.
- DLC chapters list their mode's achievements and any countable items (for RE7: Bedroom rats, Jack's 55th Birthday foods).
- Chapters render their contents only when first opened (keeps the page fast).

---

## 6. Behaviour

- One `localStorage` key, `<slug>-checklist-v1`, holding `{ got, open, tasks, coll, pad, tab }`. `got` is `{ id: true }`.
- Ticking anywhere (row, chip, 100% Guide) updates every view at once.
- Search filters achievements by name, description and guide text, and switches to the Achievements tab.
- Jump links (`{{id|label}}` in data text) switch tab, clear hiding filters, open the guide and flash the target.
- Button prompts are written as `[X]`, `[SQ]`, `[O]`, `[TR]`, `[L1]`, `[R2]`, `[R3]`, `[ST]` and rendered as coloured PlayStation or Xbox glyphs from the toggle.
- Back up downloads `<slug>-progress.json`; Restore validates it (must have a `got` object) and shows a clear message on failure.
- No unlock rates, no own favicon, no manifest or service worker (the hub blocks add those), nothing fixed in the bottom-left corner.

## 7. Writing

- British English, never em dashes. Short, practical sentences in your own words.
- Intros, run summaries, tasks and chapter tips are your own wording. Longer strategy text from trophy guides goes in the "Show guide" panels and reference boxes, with the source linked.

---

## Appendix A: data shapes

```js
const PARTS = [{ key: "base", label: "Base game", short: "Base game" }, ...];   // display order; colour from --c-<key>
const SECTIONS = [{ id, game: "<part key>", title, intro, src,
  items: [{ id: "shortid", name: "Exact Steam Name", desc: "Steam description.", pct: 12.3, tags: ["story"|"missable"|"collect"|"timed"], runs: ["r1"] }] }];
const GUIDES = { "<achievement id>": "<html>" };
const RUNS = [{ id: "r1", game, n: "Run 1", title, mode, summary, tasks: [["Task", "detail"]], body: ["paragraph", { h: "Heading" }, { ul: [...] }, { box: "<BOXES key>" }] }];
const COLL = [{ key, game, title, obj, sections: [{ title, items: [
  { k: "ach" | "story", ach: "<achievement id>", note: "tip" },              // ticks the real achievement
  { key: "stable-key", k: "<kind>", title, loc, html } ] }] }];              // a collectible
const BOXES = { "<key>": { title, html } };
const AUTO = [{ ach: "<id>", kind: "<collectible kind>", part: "<part key>", label: "Files", min: 1 /* optional; default all */ }];
```

Each achievement object keeps `id`, `name`, `desc`, `pct` first and in that order (the Steam map builder reads them). Other objects must not use the `id` then `name` pattern.

## Appendix B: base CSS

Change only the first `:root` block (and the part keys in the `[data-p]` rules if the parts differ).

```css
:root {
    /* ---- game palette: the only block that changes per game ---- */
    --bg: #0d0b07; --bg-2: #15110b; --card: #1b160f; --card-2: #251e14; --ink: #ece3cf; --ink-soft: #a8987a;
    --accent: #e8740c; --accent-ink: #170d03; --gold: #d9a441; --green: #a3ad62; --blue: #8fb0c8; --violet: #b9a0d6; --orange: #f0a04b; --warn: #f2876f;
    --line: rgba(168, 152, 122, .2); --done-bg: rgba(163, 173, 98, .08);
    --check-line: #5f523d; --task-line: #3d3527; --kbd-bg: #2a2318; --kbd-line: #4d4130; --header-ink: #e3d7bd; --desc-ink: #dccfb3; --totop-bg: rgba(37, 30, 20, .92);
    /* one colour per part of the game (base game, each DLC); used by sheets, badges, meter, chapters */
    --c-base: var(--accent); --c-bf1: #b4452f; --c-bf2: var(--gold); --c-eoz: #8e9b55; --c-nah: #7f9db3;
    /* ---- layout (do not change) ---- */
    --nav-h: 0px; --sm: 116px;
    color-scheme: dark;
  }
  *, *::before, *::after { box-sizing: border-box; }
  [hidden] { display: none !important; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: "Source Sans 3", "Segoe UI", system-ui, sans-serif; font-size: 16px; line-height: 1.55;
    padding-bottom: calc(var(--nav-h) + env(safe-area-inset-bottom, 0px)); -webkit-tap-highlight-color: transparent; }
  h1, h2, h3, h4 { margin: 0; text-wrap: balance; }
  .cond, h2, .tab, .count, .tag, .run-badge { font-family: "Barlow Condensed", "Arial Narrow", sans-serif; }
  h3 { font-weight: 700; font-size: 1.07rem; line-height: 1.3; }
  a { color: var(--gold); }
  button { font: inherit; }

  /* header */
  header { position: relative; overflow: hidden; padding: calc(1.6rem + env(safe-area-inset-top, 0px)) 1rem 2.6rem; text-align: center; background: #000; }
  .hero { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; filter: brightness(.38) saturate(.8); }
  header::before { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 60% at 50% 40%, rgba(0,0,0,.45), transparent 75%), linear-gradient(180deg, rgba(0,0,0,.2), transparent 40%, rgba(11,10,9,.7) 80%, var(--bg)); }
  header > :not(.hero) { position: relative; z-index: 1; }
  .logo { display: block; width: min(560px, 88vw); height: auto; margin: 0 auto; filter: drop-shadow(0 4px 14px #000); }
  .vh { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .eyebrow { margin-top: .9rem; font-family: "Barlow Condensed", sans-serif; font-weight: 700; letter-spacing: .3em; text-transform: uppercase; color: var(--gold); font-size: .85rem; }
  header p { max-width: 38rem; margin: .5rem auto 0; color: var(--header-ink); text-shadow: 0 1px 3px #000; font-size: .97rem; }

  main { max-width: 56rem; margin: 0 auto; padding: 0 .75rem 3rem; }

  /* tabs: top on wide screens, fixed bottom bar on phones */
  .topbar { position: sticky; top: 0; z-index: 20; background: var(--bg); margin: 0 -.75rem; padding: 0 .75rem; border-bottom: 1px solid var(--line); }
  .searchrow { display: flex; align-items: center; gap: .5rem; padding: .5rem 0; }
  .searchbox { position: relative; flex: 1; min-width: 0; }
  .searchbox svg { position: absolute; left: .65rem; top: 50%; width: 18px; height: 18px; transform: translateY(-50%); color: var(--ink-soft); pointer-events: none; }
  .topsearch { width: 100%; min-height: 42px; font: inherit; font-size: 16px; padding: .3rem 2.4rem .3rem 2.2rem; border: 1px solid var(--line); border-radius: 999px; background: var(--bg-2); color: var(--ink); }
  .topsearch::-webkit-search-cancel-button { display: none; }
  .topsearch:focus { border-color: var(--accent); outline: none; }
  .clear-search { position: absolute; right: .3rem; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border: 0; border-radius: 50%; background: none; color: var(--ink-soft); font-size: 1.2rem; cursor: pointer; }
  .search-count { flex: none; font-size: .85rem; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
  .tabs { display: flex; gap: 0; border-top: 1px solid var(--line); }
  .totop { position: fixed; right: max(1rem, env(safe-area-inset-right, 0px)); bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); z-index: 19; width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--line); background: var(--totop-bg); color: var(--ink); display: grid; place-content: center; cursor: pointer; box-shadow: 0 4px 14px rgba(0,0,0,.5); opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity .2s, transform .2s; }
  .totop.show { opacity: 1; transform: none; pointer-events: auto; }
  .totop svg { width: 20px; height: 20px; }
  .tab { flex: 1; min-height: 48px; font-weight: 700; font-size: 1.05rem; letter-spacing: .08em; text-transform: uppercase; cursor: pointer; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--ink-soft); display: flex; align-items: center; justify-content: center; gap: .45rem; padding: 0 .4rem; }
  .tab svg { width: 20px; height: 20px; flex: none; }
  .tab[aria-selected="true"] { color: var(--ink); border-bottom-color: var(--accent); }

  .panel { margin: 1rem 0; padding: .85rem .9rem; background: var(--card); border: 1px solid var(--line); border-top: 3px solid var(--accent); }
  .panel-top { display: flex; align-items: baseline; justify-content: space-between; gap: .3rem 1rem; flex-wrap: wrap; }
  .panel-top h2 { font-size: 1.15rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-soft); }
  .count { font-weight: 700; font-size: 1.35rem; font-variant-numeric: tabular-nums; }
  .count small { font-family: "Source Sans 3", sans-serif; font-weight: 400; font-size: .85rem; color: var(--ink-soft); }
  .meter { margin-top: .45rem; height: 10px; background: #000; border: 1px solid var(--line); display: flex; overflow: hidden; }
  .meter span { display: block; height: 100%; transition: width .4s ease; }
  .legend { display: flex; flex-wrap: wrap; gap: .2rem .9rem; margin-top: .35rem; font-size: .85rem; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
  .legend i { display: inline-block; width: .65rem; height: .65rem; margin-right: .3rem; vertical-align: -.05rem; }
  .row-tools { display: flex; gap: .45rem; flex-wrap: wrap; align-items: center; margin-top: .7rem; }
  .chip { min-height: 38px; font-weight: 600; font-size: .9rem; cursor: pointer; padding: .2rem .75rem; border: 1px solid var(--line); background: var(--card-2); color: var(--ink); }
  .chip[aria-pressed="true"] { background: var(--ink); color: var(--bg); border-color: var(--ink); }
  .chip.reset { color: var(--warn); border-color: color-mix(in srgb, var(--warn) 45%, transparent); }
  .chip.reset.armed { background: var(--warn); color: var(--accent-ink); }
  .select, .search { min-height: 38px; font: inherit; font-size: 16px; padding: .2rem .6rem; border: 1px solid var(--line); background: var(--bg-2); color: var(--ink); }
  .search { flex: 1 1 12rem; min-width: 0; }
  .select { flex: 1 1 12rem; min-width: 0; max-width: 100%; text-overflow: ellipsis; }
  .seg { display: inline-flex; border: 1px solid var(--line); overflow: hidden; flex-wrap: wrap; }
  .seg button { min-height: 36px; font-size: .88rem; font-weight: 600; padding: .2rem .65rem; border: 0; background: var(--card-2); color: var(--ink-soft); cursor: pointer; }
  .seg button[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }
  details.settings { margin-top: .7rem; border-top: 1px solid var(--line); padding-top: .55rem; }
  details.settings > summary { cursor: pointer; font-weight: 600; color: var(--ink-soft); font-size: .92rem; min-height: 32px; display: flex; align-items: center; }
  .save-status { color: var(--ink-soft); font-size: .88rem; flex: 1 1 100%; }
  button:focus-visible, input:focus-visible, a:focus-visible, summary:focus-visible, select:focus-visible, .spoil:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px; }

  .jumps { display: flex; gap: .35rem; overflow-x: auto; margin: 0 -.75rem 1rem; padding: 0 .75rem .3rem; scrollbar-width: thin; }
  .jump { flex: none; font-size: .88rem; font-weight: 600; color: var(--ink); text-decoration: none; padding: .35rem .65rem; background: var(--card); border: 1px solid var(--line); border-left: 3px solid var(--accent); font-variant-numeric: tabular-nums; white-space: nowrap; }
  .jump span { color: var(--ink-soft); }

  section.sheet { background: var(--card); border: 1px solid var(--line); border-top: 3px solid var(--accent); padding: .9rem .85rem .4rem; margin-bottom: 1.3rem; scroll-margin-top: var(--sm); }
  .sheet-head { display: flex; align-items: baseline; justify-content: space-between; gap: .3rem .8rem; flex-wrap: wrap; }
  .sheet-head h2 { font-size: 1.6rem; font-weight: 700; letter-spacing: .03em; text-transform: uppercase; line-height: 1.05; }
  .sheet-head h2 small { display: block; font-size: .55em; letter-spacing: .16em; color: var(--accent); }
  .sheet-head .sub { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 1.15rem; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
  .intro { margin: .3rem 0 .5rem; color: var(--ink-soft); font-size: .96rem; }

  ul.items { list-style: none; margin: 0; padding: 0; }
  li.item { border-top: 1px solid var(--line); padding: .55rem 0; scroll-margin-top: var(--sm); }
  li.item.hidden { display: none; }
  .row { display: grid; grid-template-columns: auto 1fr; gap: .7rem; align-items: start; padding: .35rem .3rem; }
  .row > div { min-width: 0; }
  li.item.done > .row { background: var(--done-bg); }
  .flash { outline: 2px solid var(--blue); outline-offset: 2px; }

  .check { appearance: none; -webkit-appearance: none; margin: 0; width: 30px; height: 30px; cursor: pointer; border: 2px solid var(--check-line); background: var(--bg-2); border-radius: 3px; display: grid; place-content: center; flex: none; }
  .check.small { width: 24px; height: 24px; }
  .check::before { content: ""; width: 17px; height: 17px; clip-path: polygon(14% 44%, 0 59%, 40% 100%, 100% 22%, 85% 8%, 39% 69%); background: #08130a; transform: scale(0); transition: transform .12s; }
  .check.small::before { width: 13px; height: 13px; }
  .check:checked { background: var(--green); border-color: var(--green); }
  .check:checked::before { transform: scale(1); }
  .check:indeterminate { border-color: var(--gold); }
  .check:indeterminate::before { clip-path: none; height: 3px; width: 13px; background: var(--gold); transform: scale(1); }

  .title-line { display: flex; align-items: center; gap: .25rem .45rem; flex-wrap: wrap; }
  .title-line h3 { flex: 1 1 100%; }
  .title-line h3 label { cursor: pointer; }
  li.item.done .title-line h3 { color: var(--ink-soft); text-decoration: line-through; text-decoration-color: var(--green); }
  .tag { display: inline-block; font-size: .78rem; font-weight: 700; padding: 0 .4rem; letter-spacing: .06em; text-transform: uppercase; border: 1px solid currentColor; line-height: 1.5; }
  .tag.story { color: var(--blue); } .tag.missable { color: var(--warn); } .tag.collect { color: var(--green); } .tag.timed { color: var(--orange); }
  .run-badge { display: inline-block; font-size: .78rem; font-weight: 700; letter-spacing: .05em; padding: 0 .45rem; line-height: 1.55; background: var(--pc, var(--accent)); color: var(--accent-ink); text-decoration: none; }
  .desc { margin: .15rem 0 0; color: var(--desc-ink); }

  .steps { list-style: none; margin: .5rem 0 0; padding: 0; display: grid; gap: .3rem; grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr)); }
  .steps li { display: grid; grid-template-columns: auto 1fr; gap: .55rem; align-items: center; padding: .35rem .5rem; background: var(--bg-2); border-left: 2px solid var(--task-line); font-size: .94rem; min-height: 44px; }
  .steps li.got { border-left-color: var(--green); background: var(--done-bg); }
  .steps li.got .st-name { text-decoration: line-through; color: var(--ink-soft); }
  .steps label { cursor: pointer; min-width: 0; }
  .st-name { font-weight: 600; }
  .st-desc { display: block; color: var(--ink-soft); font-size: .84rem; }
  details.steps-wrap { margin-top: .5rem; }
  details.steps-wrap > summary { cursor: pointer; font-weight: 600; color: var(--gold); font-size: .95rem; min-height: 36px; display: flex; align-items: center; }
  .mini { min-height: 34px; font-size: .85rem; font-weight: 600; cursor: pointer; padding: .1rem .6rem; border: 1px solid var(--line); background: var(--card-2); color: var(--ink-soft); }
  .step-tools { display: flex; gap: .4rem; flex-wrap: wrap; margin-top: .45rem; }

  .counter { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; margin-top: .5rem; font-weight: 600; font-variant-numeric: tabular-nums; }
  .step-btn { font-weight: 700; width: 42px; height: 42px; border: 1px solid var(--line); background: var(--card-2); color: var(--ink); cursor: pointer; font-size: 1.2rem; line-height: 1; }
  .count-input { font: inherit; font-size: 16px; font-weight: 700; width: 4.2rem; height: 42px; text-align: center; border: 1px solid var(--line); background: var(--bg-2); color: var(--ink); }
  .counter .of { color: var(--ink-soft); }
  .summary-line { margin-top: .45rem; font-size: .93rem; font-weight: 600; color: var(--ink-soft); }
  .summary-line b { color: var(--ink); }

  .guide-btn { min-height: 36px; font-weight: 600; font-size: .93rem; margin-top: .25rem; cursor: pointer; background: none; border: none; padding: .1rem 0; color: var(--gold); text-decoration: underline; text-underline-offset: 3px; }
  .guide { margin: .4rem 0 0; padding: .7rem .8rem; border-left: 2px solid var(--accent); background: var(--bg-2); font-size: .97rem; }
  .guide > * + *, .prose > * + * { margin-top: .5rem; }
  .guide p, .prose p { margin: 0; }
  .guide h4, .prose h4 { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 1rem; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); margin-top: .8rem; }
  .guide ul, .prose ul { margin: 0; padding-left: 1.1rem; }
  .guide li + li, .prose li + li { margin-top: .3rem; }
  .note { color: var(--ink-soft); font-style: italic; }
  .warn { color: var(--warn); font-weight: 600; }
  .spoil { background: var(--kbd-line); color: transparent; border-radius: 2px; cursor: pointer; user-select: none; }
  .spoil.shown, body.spoilers .spoil { background: transparent; color: inherit; user-select: auto; cursor: auto; }

  kbd.b { display: inline-flex; align-items: center; justify-content: center; min-width: 1.45em; height: 1.45em; padding: 0 .3em; margin: 0 .05em; border-radius: 999px; font: 700 .78em/1 "Source Sans 3", sans-serif; vertical-align: .08em; background: var(--kbd-bg); color: var(--ink); border: 1px solid var(--kbd-line); }
  kbd.b.sh { border-radius: 3px; }
  kbd.ps-X { color: #8ab8ff; } kbd.ps-SQ { color: #f29ac8; } kbd.ps-O { color: #ff7676; } kbd.ps-TR { color: #5fd6aa; }
  kbd.xb-X { color: #7bd67b; } kbd.xb-SQ { color: #6aa8ff; } kbd.xb-O { color: #ff7676; } kbd.xb-TR { color: #f4cf55; }

  .tlinks { display: flex; flex-wrap: wrap; gap: .3rem; margin-top: .5rem; }
  .tlink { font-size: .85rem; font-weight: 600; text-decoration: none; padding: .15rem .5rem; border: 1px solid var(--line); color: var(--ink); background: var(--bg-2); }
  .tlink.done { color: var(--green); border-color: color-mix(in srgb, var(--green) 45%, transparent); }

  /* runs */
  .runmap { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(9.5rem, 100%), 1fr)); gap: .4rem; margin-bottom: 1rem; }
  .runmap a { display: block; text-decoration: none; color: var(--ink); background: var(--card); border: 1px solid var(--line); border-top: 3px solid var(--accent); padding: .45rem .55rem; }
  .runmap a.full { background: var(--done-bg); }
  .runmap b { display: block; font-family: "Barlow Condensed", sans-serif; font-size: 1.05rem; letter-spacing: .03em; }
  .runmap span { font-size: .82rem; color: var(--ink-soft); }
  .run { scroll-margin-top: var(--sm); }
  .run .mode { font-family: "Barlow Condensed", sans-serif; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--gold); font-size: .95rem; }
  .run .tasks { list-style: none; margin: .6rem 0 0; padding: 0; display: grid; gap: .3rem; }
  .run .tasks li { display: grid; grid-template-columns: auto 1fr; gap: .6rem; align-items: center; padding: .4rem .5rem; background: var(--bg-2); border-left: 2px solid var(--task-line); min-height: 48px; }
  .run .tasks li.got { border-left-color: var(--green); background: var(--done-bg); }
  .run .tasks li.got .st-name { text-decoration: line-through; color: var(--ink-soft); }
  .box { margin-top: .7rem; padding: .7rem .8rem; background: var(--bg-2); border: 1px solid var(--line); }
  .box h4 { font-family: "Barlow Condensed", sans-serif; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); font-size: 1rem; margin-bottom: .3rem; }
  .box ul, .box ol { margin: .2rem 0 0; padding-left: 1.2rem; }
  .box li + li { margin-top: .25rem; }
  .ok { color: var(--green); font-weight: 700; } .no { color: var(--warn); font-weight: 700; }
  table { border-collapse: collapse; width: 100%; font-size: .92rem; }
  th, td { text-align: left; padding: .35rem .4rem; border-bottom: 1px solid var(--line); vertical-align: top; }
  th { font-family: "Barlow Condensed", sans-serif; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); font-weight: 700; }

  /* 100% guide */
  .kinds { display: flex; gap: .35rem; flex-wrap: wrap; }
  details.chapter { background: var(--card); border: 1px solid var(--line); border-left: 4px solid var(--accent); margin-bottom: .55rem; scroll-margin-top: var(--sm); }
  details.chapter.full { border-left-color: var(--green); }
  details.chapter > summary { list-style: none; cursor: pointer; padding: .7rem .8rem; display: grid; grid-template-columns: 1fr auto; gap: .2rem .6rem; align-items: center; min-height: 56px; }
  details.chapter > summary::-webkit-details-marker { display: none; }
  .ch-title { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 1.35rem; letter-spacing: .04em; text-transform: uppercase; }
  .ch-count { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 1.1rem; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
  .ch-meta { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: .15rem .7rem; font-size: .84rem; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
  .ch-meta .kd { color: var(--ink); font-weight: 600; }
  .ch-body { padding: 0 .6rem .6rem; }
  .ch-obj { font-size: .9rem; color: var(--ink-soft); margin: 0 0 .4rem; }
  .sec-h { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: 1.05rem; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); margin: .9rem 0 .35rem; padding-bottom: .2rem; border-bottom: 1px solid var(--line); }
  .sec-note { font-size: .9rem; color: var(--ink-soft); font-style: italic; }
  .ci { display: grid; grid-template-columns: auto 1fr; gap: .6rem; padding: .55rem .35rem; border-top: 1px solid var(--line); scroll-margin-top: var(--sm); }
  .ci.got { background: var(--done-bg); }
  .ci.got .ci-title { color: var(--ink-soft); text-decoration: line-through; text-decoration-color: var(--green); }
  .ci.hidden { display: none; }
  .ci > div { min-width: 0; }
  .ci-head { display: flex; flex-wrap: wrap; align-items: center; gap: .2rem .5rem; }
  .kind { font-family: "Barlow Condensed", sans-serif; font-size: .78rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 0 .4rem; border: 1px solid currentColor; line-height: 1.5; color: var(--ink-soft); }
  .ci-title { font-weight: 700; flex: 1 1 100%; }
  .shot { display: block; width: 100%; max-width: 520px; height: auto; aspect-ratio: 16 / 9; object-fit: cover; margin-top: .45rem; background: #000; border: 1px solid var(--line); cursor: zoom-in; }
  .shot.zoom { max-width: none; cursor: zoom-out; }
  .maplink { display: inline-block; margin-top: .3rem; font-size: .88rem; font-weight: 600; min-height: 30px; }
  .ci ul { margin: .4rem 0 0; padding-left: 1.1rem; font-size: .95rem; }
  .ci li + li { margin-top: .2rem; }

  .empty { text-align: center; color: var(--ink-soft); font-weight: 600; padding: .5rem 0 1rem; }
  footer { text-align: center; padding: 0 1rem 2rem; font-size: .87rem; color: var(--ink-soft); max-width: 50rem; margin: 0 auto; }


  /* ---- parts: every element with data-p takes its part colour ---- */
  [data-p="base"] { --pc: var(--c-base); } [data-p="bf1"] { --pc: var(--c-bf1); } [data-p="bf2"] { --pc: var(--c-bf2); } [data-p="eoz"] { --pc: var(--c-eoz); } [data-p="nah"] { --pc: var(--c-nah); }
  section.sheet, .runmap a { border-top-color: var(--pc, var(--accent)); }
  .sheet-head h2 small { color: var(--pc, var(--accent)); }
  .jump, details.chapter { border-left-color: var(--pc, var(--accent)); }
  .guide { border-left-color: var(--pc, var(--accent)); }
  .meter span { background: var(--pc, var(--accent)); }
  .legend i { background: var(--pc, var(--accent)); }

  /* header: title text shown only until a logo image is embedded */
  .logo[src=""], .hero[src=""] { display: none; }
  .logo:not([src=""]) ~ h1.title { position: absolute !important; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  h1.title { font-family: "Barlow Condensed", sans-serif; font-weight: 700; font-size: clamp(2.2rem, 9vw, 3.6rem); letter-spacing: .04em; text-transform: uppercase; line-height: 1; text-shadow: 0 3px 16px #000; }

  /* 100% Guide item kinds and helpers */
  .kind.k-ach { color: var(--accent); } .kind.k-story { color: var(--blue); } .kind.k-file { color: var(--blue); } .kind.k-coin { color: var(--gold); }
  .kind.k-statue { color: var(--orange); } .kind.k-tape { color: var(--violet); } .kind.k-food { color: var(--green); } .kind.k-rat { color: var(--warn); }
  .ci-loc { font-size: .85rem; color: var(--ink-soft); }
  .ci-desc { margin-top: .3rem; font-size: .95rem; color: var(--desc-ink); }
  .ci-desc > * + * { margin-top: .4rem; } .ci-desc p { margin: 0; }
  .tablewrap { overflow-x: auto; margin-top: .4rem; }
  .tablewrap table { min-width: 34rem; }
  .guide table, .box table { font-size: .9rem; }
  .guide .tablewrap table td:first-child { white-space: nowrap; }
  details.more { margin-top: .7rem; background: var(--bg-2); border: 1px solid var(--line); }
  details.more > summary { cursor: pointer; padding: .55rem .8rem; font-family: "Barlow Condensed", sans-serif; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--gold); min-height: 44px; display: flex; align-items: center; }
  details.more > .prose { padding: 0 .8rem .8rem; }
  .prose h4 { margin-top: .8rem; }
  .prose table td, .guide table td { overflow-wrap: anywhere; }

  @media (max-width: 699px) {
    :root { --nav-h: 62px; --sm: 70px; }
    .tabs { position: fixed; top: auto; bottom: 0; left: 0; right: 0; z-index: 20; margin: 0; padding: 0 0 env(safe-area-inset-bottom, 0px); background: var(--bg); }
    .totop { width: 38px; height: 38px; right: .75rem; bottom: calc(var(--nav-h) + .7rem + env(safe-area-inset-bottom, 0px)); }
    .totop svg { width: 17px; height: 17px; }
    .tab { flex-direction: column; gap: .1rem; font-size: .8rem; min-height: var(--nav-h); border-bottom: 0; border-top: 3px solid transparent; }
    .tab[aria-selected="true"] { border-top-color: var(--accent); }
  }
  @media (min-width: 700px) {
    main { padding: 0 1.2rem 3rem; }
    .topbar { margin: 0 -1.2rem; padding: 0 1.2rem; }
    section.sheet { padding: 1.1rem 1.2rem .5rem; }
    .title-line h3 { flex: 0 1 auto; }
    .ci-title { flex: 0 1 auto; }
  }
  @media (prefers-reduced-motion: reduce) { .meter span, .check::before { transition: none; } }

/* Filter buttons stretch to fill the row; text stays centred with equal padding either side */
#view-ach .row-tools > .seg { flex: 1 1 auto; display: flex; }
#view-ach .row-tools > .seg > button { flex: 1 1 auto; text-align: center; }
#view-ach .row-tools > .chip, #view-ach .row-tools > .select { flex: 1 1 auto; text-align: center; }
```

## Appendix C: page template and engine

This is `re7.html` before its data is filled in. To start a new guide, copy it and change: the `<title>`, header text, footer, `KEY`, the intro sentences in `renderRuns` and `renderColl`, `KIND_LABEL` / `KIND_PLURAL` (collectible kinds for that game), the CSS palette, and fill the data placeholders (`/*PARTS*/`, `/*SECTIONS*/` and so on). Keep everything else.

```html
<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=0.85, viewport-fit=cover">
<meta name="theme-color" content="#0d0b07">
<title>Resident Evil 7 Biohazard 100%</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
<style>
/*CSS*/
</style>
</head>
<body>
<header>
  <img class="hero" src="" alt="" width="1600" height="516">
  <img class="logo" src="" alt="Resident Evil 7 Biohazard" width="900" height="390">
  <h1 class="title">Resident Evil 7 Biohazard</h1>
  <div class="eyebrow">Steam · 100% checklist</div>
  <p>All 58 achievements for the base game, Banned Footage Vol. 1 and 2, End of Zoe and Not a Hero, your playthrough plan run by run, and a 100% guide with every collectible and chapter achievement. Progress saves in this browser.</p>
</header>

<main>
  <div class="topbar">
  <div class="searchrow" role="search">
    <div class="searchbox">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
      <input type="search" class="topsearch" id="search" placeholder="Search achievements" aria-label="Search achievements" autocomplete="off" enterkeyhint="search">
      <button class="clear-search" id="clear-search" aria-label="Clear search" hidden>×</button>
    </div>
    <span class="search-count" id="search-count" aria-live="polite"></span>
  </div>
  <nav class="tabs" role="tablist" aria-label="Sections">
    <button class="tab" role="tab" id="tab-ach" data-tab="ach" aria-controls="view-ach" aria-selected="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg>Achievements</button>
    <button class="tab" role="tab" id="tab-runs" data-tab="runs" aria-controls="view-runs" aria-selected="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="19" cy="18" r="2"/></svg>Playthroughs</button>
    <button class="tab" role="tab" id="tab-coll" data-tab="coll" aria-controls="view-coll" aria-selected="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/></svg>100% Guide</button>
  </nav>
  </div>

  <div class="panel" role="region" aria-label="Progress">
    <div class="panel-top"><h2>Completion</h2><span class="count" id="count"></span></div>
    <div class="meter" role="progressbar" aria-label="Achievement progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="bar"></div>
    <div class="legend" id="legend"></div>
    <details class="settings">
      <summary>Save, back up and settings</summary>
      <div class="row-tools">
        <span class="save-status" id="save-status">Saved in this browser automatically. To move progress to your phone, Back up here and Restore there.</span>
        <button class="chip" id="export">Back up</button>
        <button class="chip" id="import">Restore</button>
        <input type="file" id="import-file" accept=".json,application/json" hidden>
        <span class="seg" role="group" aria-label="Button prompts"><button data-pad="ps" aria-pressed="true">PlayStation</button><button data-pad="xb" aria-pressed="false">Xbox</button></span>
        <button class="chip reset" id="reset" data-steam-reset>Reset to Steam data</button>
      </div>
    </details>
  </div>

  <div id="view-ach" role="tabpanel" aria-labelledby="tab-ach"></div>
  <div id="view-runs" role="tabpanel" aria-labelledby="tab-runs" hidden></div>
  <div id="view-coll" role="tabpanel" aria-labelledby="tab-coll" hidden></div>
</main>

<footer>
  Achievement names and descriptions from Steam (app 418370, 0 of 58 unlocked when this was made). Strategies, the collectible walkthrough and the Miracle Chef and Ratcatcher tables come from the PSNProfiles trophy guides for the base game and each DLC, linked in every section.
</footer>
<button class="totop" id="totop" aria-label="Back to top"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
<script>
(function () {
"use strict";
const KEY = "re7-checklist-v1";

/* Game parts, in display order. Colours come from --c-<key> in the CSS. */
const PARTS = /*PARTS*/;

/* Achievement categories. Each achievement object starts id, name, desc, pct (Steam sync reads these). */
const SECTIONS = [
/*SECTIONS*/
];

/* Guide text per achievement (HTML; [X] style tokens become button glyphs). */
const GUIDES = /*GUIDES*/;

/* Playthroughs. */
const RUNS = /*RUNS*/;

/* 100% Guide chapters: collectibles and chapter achievements in story order. */
const COLL = /*COLL*/;

/* Reference boxes (HTML) shown inside runs. */
const BOXES = /*BOXES*/;

/* Collectible totals that tick an achievement automatically. */
const AUTO = /*AUTO*/;

const PADS = {
  ps: { X: ["✕", "ps-X"], SQ: ["□", "ps-SQ"], O: ["○", "ps-O"], TR: ["△", "ps-TR"], L1: ["L1", "sh"], L2: ["L2", "sh"], R1: ["R1", "sh"], R2: ["R2", "sh"], L3: ["L3", "sh"], R3: ["R3", "sh"], ST: ["Options", "sh"] },
  xb: { X: ["A", "xb-X"], SQ: ["X", "xb-SQ"], O: ["B", "xb-O"], TR: ["Y", "xb-TR"], L1: ["LB", "sh"], L2: ["LT", "sh"], R1: ["RB", "sh"], R2: ["RT", "sh"], L3: ["LS", "sh"], R3: ["RS", "sh"], ST: ["Menu", "sh"] }
};
const TAGS = { story: "Story", missable: "Missable", collect: "Collectable", timed: "Time limited" };
const KIND_LABEL = { ach: "Achievement", story: "Story", file: "File", coin: "Antique Coin", statue: "Mr. Everywhere", tape: "Videotape", rat: "Dead rat", food: "Food" };
const KIND_PLURAL = { ach: "Achievements", story: "Story", file: "Files", coin: "Antique Coins", statue: "Statuettes", tape: "Videotapes", rat: "Dead rats", food: "Foods and drinks" };
const PART_BY = Object.fromEntries(PARTS.map(p => [p.key, p]));
const RUN_BY_ID = Object.fromEntries(RUNS.map(r => [r.id, r]));
const ALL = SECTIONS.flatMap(s => s.items.map(a => Object.assign(a, { game: s.game })));
const BY_ID = Object.fromEntries(ALL.map(a => [a.id, a]));
const CITEMS = COLL.flatMap(ch => ch.sections.flatMap(s => s.items.map(it => Object.assign(it, { ch: ch.key }))));
const CBY = Object.fromEntries(CITEMS.filter(i => i.key).map(i => [i.key, i]));

/* ---------------- state ---------------- */
function blank() { return { got: {}, open: {}, tasks: {}, coll: {}, pad: "ps", tab: "ach" }; }
function clean(src) {
  const out = blank();
  if (!src || typeof src !== "object") return out;
  for (const k of ["got", "open", "tasks", "coll"]) if (src[k] && typeof src[k] === "object") for (const x in src[k]) if (src[k][x] === true) out[k][x] = true;
  if (src.pad === "xb") out.pad = "xb";
  if (["runs", "coll"].includes(src.tab)) out.tab = src.tab;
  return out;
}
let state;
try { const raw = localStorage.getItem(KEY); state = raw ? clean(JSON.parse(raw)) : blank(); } catch (e) { state = blank(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
let filter = "all", game = "all", runFilter = "all", query = "", kindFilter = "all", hideGot = false;

/* ---------------- helpers ---------------- */
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function targetId(id) {
  if (BY_ID[id]) return "a-" + id;
  if (RUN_BY_ID[id]) return "run-" + id;
  if (id === "coll") return "coll-top";
  if (id === "runs") return "runs-top";
  return id;
}
function buttons(t) { return t.replace(/\[(X|SQ|O|TR|L1|L2|R1|R2|L3|R3|ST)\]/g, (_, k) => { const [g, c] = PADS[state.pad][k]; return `<kbd class="b ${state.pad}-${k} ${c}">${g}</kbd>`; }); }
function fmt(s) {
  let t = esc(s);
  t = t.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  t = t.replace(/\{\{([\w-]+)\|([^}]+)\}\}/g, (_, id, label) => `<a href="#${targetId(id)}" data-jump="${id}">${label}</a>`);
  return buttons(t);
}
function blocks(list) {
  return list.map(b => typeof b === "string" ? `<p>${fmt(b)}</p>` : b.h ? `<h4>${esc(b.h)}</h4>` : b.ul ? `<ul>${b.ul.map(x => `<li>${fmt(x)}</li>`).join("")}</ul>` : b.box ? `<details class="more"><summary>${esc(BOXES[b.box].title)}</summary><div class="prose">${rich(BOXES[b.box].html)}</div></details>` : "").join("");
}
/* PSN guide HTML: button tokens, trophy lists as jump chips, wide tables scroll inside their box */
function rich(h) {
  return buttons(h)
    .replace(/<div class="achrefs" data-ids="([^"]*)"><\/div>/g, (_, ids) => `<div class="tlinks">${ids.split(",").filter(id => BY_ID[id]).map(id => `<a class="tlink" href="#a-${id}" data-jump="${id}" data-tl="${id}">${esc(BY_ID[id].name)}</a>`).join("")}</div>`)
    .replace(/<table>/g, '<div class="tablewrap"><table>').replace(/<\/table>/g, "</table></div>");
}
const runBadge = id => { const r = RUN_BY_ID[id]; return `<a class="run-badge" data-p="${r.game}" href="#run-${id}" data-jump="${id}">${esc(r.n)}</a>`; };
const autoGot = rule => CITEMS.filter(i => i.k === rule.kind && i.ch !== undefined && (!rule.part || COLL.find(c => c.key === i.ch).game === rule.part) && state.coll[i.key]).length;
const autoTotal = rule => CITEMS.filter(i => i.k === rule.kind && (!rule.part || COLL.find(c => c.key === i.ch).game === rule.part)).length;

/* ---------------- progress & auto ticks ---------------- */
function snapshot() { return AUTO.map(autoGot); }
function applyAuto(before) {
  AUTO.forEach((r, i) => {
    const now = autoGot(r), need = r.min || autoTotal(r);
    if (now >= need && before[i] < need) state.got[r.ach] = true;
  });
}
function change(fn) { const b = snapshot(); fn(); applyAuto(b); save(); update(); }

/* ---------------- render: achievements ---------------- */
function renderItem(a) {
  const auto = AUTO.find(r => r.ach === a.id && !r.min);
  return `<li class="item" id="a-${a.id}"><div class="row">
    <input type="checkbox" class="check" id="c-${a.id}" data-ach="${a.id}" aria-label="Mark ${esc(a.name)} as unlocked">
    <div>
      <div class="title-line">
        <h3><label for="c-${a.id}">${esc(a.name)}</label></h3>
        ${a.runs.map(runBadge).join("")}
        ${(a.tags || []).map(t => `<span class="tag ${t}">${TAGS[t]}</span>`).join("")}
      </div>
      <p class="desc">${esc(a.desc)}</p>
      ${auto ? `<div class="summary-line" data-autoline="${a.id}"></div>` : ""}
      ${GUIDES[a.id] ? `<button class="guide-btn" aria-expanded="false" aria-controls="g-${a.id}">Show guide</button>
      <div class="guide" id="g-${a.id}" data-p="${a.game}" hidden></div>` : ""}
    </div></div></li>`;
}
function renderAch() {
  const runOpts = RUNS.map(r => `<option value="${r.id}">${esc(r.n + ": " + r.title)}</option>`).join("");
  document.getElementById("view-ach").innerHTML = `
    <div class="row-tools" style="margin-bottom:.6rem">
      <span class="seg" role="group" aria-label="Status"><button data-filter="all" aria-pressed="true">All</button><button data-filter="todo" aria-pressed="false">To do</button><button data-filter="done" aria-pressed="false">Unlocked</button><button data-filter="missable" aria-pressed="false">Missable</button></span>
      <span class="seg" role="group" aria-label="Game or DLC"><button data-game="all" aria-pressed="true">All</button>${PARTS.map(p => `<button data-game="${p.key}" aria-pressed="false">${esc(p.short)}</button>`).join("")}</span>
      <select class="select" id="run-filter" aria-label="Filter by playthrough"><option value="all">Any playthrough</option>${runOpts}</select>
      <button class="chip" id="expand" aria-pressed="false">Show all guides</button>
    </div>
    <nav class="jumps" aria-label="Categories">${SECTIONS.map(s => `<a class="jump" data-p="${s.game}" href="#sec-${s.id}">${esc(s.title)} <span data-jcount="${s.id}"></span></a>`).join("")}</nav>
    ${SECTIONS.map(sec => `<section class="sheet" data-p="${sec.game}" id="sec-${sec.id}">
      <div class="sheet-head"><h2><small>${esc(PART_BY[sec.game].label)}</small>${esc(sec.title)}</h2><span class="sub" data-sub="${sec.id}"></span></div>
      <p class="intro">${fmt(sec.intro)}${sec.src ? ` <a href="${sec.src}" target="_blank" rel="noopener">Guide source ↗</a>` : ""}</p>
      <ul class="items">${sec.items.map(renderItem).join("")}</ul>
      <p class="empty" data-empty="${sec.id}" hidden>Nothing here for this filter.</p>
    </section>`).join("")}`;
}

/* ---------------- render: runs ---------------- */
function renderRuns() {
  const achFor = id => ALL.filter(a => a.runs.includes(id));
  document.getElementById("view-runs").innerHTML = `
    <section class="sheet" id="runs-top"><div class="sheet-head"><h2><small>Your plan</small>Playthroughs</h2><span class="sub" id="runs-count"></span></div>
      <p class="intro">Four base-game runs, starting with a blind first run just to enjoy the game, then Not a Hero, End of Zoe and the two Banned Footage volumes. Each run's tasks are tickable, and its chips show which achievements it should unlock.</p>
      <div class="runmap">${RUNS.map(r => `<a href="#run-${r.id}" data-jump="${r.id}" data-p="${r.game}" data-runcard="${r.id}"><b>${esc(r.n)}</b><span>${esc(r.title)}</span><br><span data-runprog="${r.id}"></span></a>`).join("")}</div>
    </section>
    ${RUNS.map(r => `<section class="sheet run" data-p="${r.game}" id="run-${r.id}">
      <div class="sheet-head"><h2><small>${esc(PART_BY[r.game].label)} · ${esc(r.n)}</small>${esc(r.title)}</h2><span class="sub" data-runsub="${r.id}"></span></div>
      <div class="mode">${esc(r.mode)}</div>
      <p class="intro">${fmt(r.summary)}</p>
      <ul class="tasks">${r.tasks.map((t, i) => `<li data-task="${r.id}:${i}"><input type="checkbox" class="check small" id="t-${r.id}-${i}" data-taskcheck="${r.id}:${i}"><label for="t-${r.id}-${i}"><span class="st-name">${fmt(t[0])}</span>${t[1] ? `<span class="st-desc">${fmt(t[1])}</span>` : ""}</label></li>`).join("")}</ul>
      ${achFor(r.id).length ? `<div class="tlinks">${achFor(r.id).map(a => `<a class="tlink" href="#a-${a.id}" data-jump="${a.id}" data-tl="${a.id}">${esc(a.name)}</a>`).join("")}</div>` : ""}
      ${r.body ? `<div class="prose" style="margin-top:.7rem">${blocks(r.body)}</div>` : ""}
      <p></p>
    </section>`).join("")}`;
}

/* ---------------- render: 100% guide ---------------- */
function renderColl() {
  const kinds = [...new Set(CITEMS.map(i => i.k))];
  document.getElementById("view-coll").innerHTML = `
    <section class="sheet" id="coll-top"><div class="sheet-head"><h2><small>Runs 2 and DLCs</small>100% Guide</h2><span class="sub" id="coll-count"></span></div>
      <p class="intro">Every file, Antique Coin, Mr. Everywhere statuette and videotape (Easy and Normal placements) in story order, with the achievements tied to each chapter, then each DLC mode. Ticking a collectible here counts towards its achievement, and the last one ticks it for you. Madhouse has its own 33 coins: see {{mad-pelicans|Mad Pelicans}}.</p>
      <div class="row-tools">
        <span class="seg" role="group" aria-label="Show"><button data-kind="all" aria-pressed="true">All</button>${kinds.map(k => `<button data-kind="${k}" aria-pressed="false">${esc(KIND_PLURAL[k])}</button>`).join("")}</span>
        <button class="chip" id="hide-got" aria-pressed="false">Hide ticked</button>
      </div>
      <div class="summary-line" id="coll-kinds"></div><p></p>
    </section>
    ${COLL.map(ch => `<details class="chapter" id="ch-${ch.key}" data-ch="${ch.key}" data-p="${ch.game}">
      <summary><span class="ch-title">${esc(ch.title)}</span><span class="ch-count" data-chcount="${ch.key}"></span><span class="ch-meta" data-chmeta="${ch.key}"></span></summary>
      <div class="ch-body" data-chbody="${ch.key}"></div></details>`).join("")}`;
  document.querySelector("#coll-top .intro").innerHTML = fmt(document.querySelector("#coll-top .intro").textContent);
}
function ciHtml(it) {
  if (it.k === "ach" || it.k === "story") {
    const a = BY_ID[it.ach];
    return `<div class="ci" data-ciach="${a.id}" data-k="${it.k}">
      <input type="checkbox" class="check small" id="cca-${a.id}-${it.ch}" data-ach="${a.id}" aria-label="Unlocked: ${esc(a.name)}">
      <div><div class="ci-head"><span class="kind k-${it.k}">${KIND_LABEL[it.k]}</span><label class="ci-title" for="cca-${a.id}-${it.ch}">${esc(a.name)}</label></div>
      <div class="ci-loc">${esc(a.desc)}</div>
      ${it.note ? `<div class="ci-desc"><p>${fmt(it.note)}</p></div>` : ""}
      <a class="maplink" href="#a-${a.id}" data-jump="${a.id}">Open its guide ›</a></div></div>`;
  }
  return `<div class="ci" id="ci-${it.key}" data-ci="${it.key}" data-k="${it.k}">
    <input type="checkbox" class="check small" id="cc-${it.key}" data-coll="${it.key}" aria-label="Collected: ${esc(it.title)}">
    <div><div class="ci-head"><span class="kind k-${it.k}">${KIND_LABEL[it.k]}</span><label class="ci-title" for="cc-${it.key}">${esc(it.title)}</label></div>
    ${it.loc ? `<div class="ci-loc">${esc(it.loc)}</div>` : ""}
    ${it.html ? `<div class="ci-desc">${rich(it.html)}</div>` : ""}</div></div>`;
}
function renderChapter(key) {
  const ch = COLL.find(c => c.key === key), body = document.querySelector(`[data-chbody="${key}"]`);
  if (body.dataset.done) return;
  body.dataset.done = "1";
  body.innerHTML = (ch.obj ? `<p class="ch-obj">${fmt(ch.obj)}</p>` : "") +
    ch.sections.map(s => `${s.title ? `<div class="sec-h">${esc(s.title)}</div>` : ""}${s.items.map(ciHtml).join("")}`).join("");
  updateColl();
}

function render() {
  renderAch(); renderRuns(); renderColl();
  document.querySelectorAll(".guide-btn").forEach(b => { if (state.open[b.getAttribute("aria-controls").slice(2)]) toggleGuide(b, true); });
  setTab(state.tab, true);
  syncChips(); syncPad();
  update();
}

/* ---------------- behaviour ---------------- */
function toggleGuide(btn, force) {
  const id = btn.getAttribute("aria-controls").slice(2), panel = document.getElementById("g-" + id);
  const open = force !== undefined ? force : panel.hidden;
  if (open && !panel.dataset.done) { panel.innerHTML = rich(GUIDES[id]); panel.dataset.done = "1"; update(); }
  panel.hidden = !open; btn.setAttribute("aria-expanded", String(open)); btn.textContent = open ? "Hide guide" : "Show guide";
  if (open) state.open[id] = true; else delete state.open[id];
}
function setTab(t, quiet) {
  state.tab = t;
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === t)));
  ["ach", "runs", "coll"].forEach(v => document.getElementById("view-" + v).hidden = v !== t);
  if (!quiet) { save(); const v = document.getElementById("view-" + t); window.scrollTo({ top: Math.min(window.scrollY, v.getBoundingClientRect().top + window.scrollY - document.querySelector(".topbar").offsetHeight - 8), behavior: "auto" }); }
}
function jumpTo(id) {
  const el = document.getElementById(targetId(id));
  if (!el) return;
  const view = el.closest("[role=tabpanel]").id.slice(5);
  if (view !== state.tab) setTab(view, true), save();
  if (el.classList.contains("hidden") || (el.closest("section.sheet") || {}).hidden) { filter = "all"; game = "all"; runFilter = "all"; query = ""; searchEl.value = ""; clearEl.hidden = true; document.getElementById("run-filter").value = "all"; syncChips(); update(); }
  const btn = el.querySelector(":scope > .row .guide-btn");
  if (btn && btn.getAttribute("aria-expanded") !== "true") { toggleGuide(btn, true); save(); }
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 1600);
  });
}

const mainEl = document.querySelector("main");
mainEl.addEventListener("change", e => {
  const t = e.target;
  if (t.dataset.ach) change(() => { if (t.checked) state.got[t.dataset.ach] = true; else delete state.got[t.dataset.ach]; });
  else if (t.dataset.taskcheck) { if (t.checked) state.tasks[t.dataset.taskcheck] = true; else delete state.tasks[t.dataset.taskcheck]; save(); update(); }
  else if (t.dataset.coll) change(() => { if (t.checked) state.coll[t.dataset.coll] = true; else delete state.coll[t.dataset.coll]; });
  else if (t.id === "run-filter") { runFilter = t.value; update(); }
});
const searchEl = document.getElementById("search"), clearEl = document.getElementById("clear-search");
function runSearch(v) {
  query = v.trim().toLowerCase();
  clearEl.hidden = !v;
  if (query && state.tab !== "ach") setTab("ach", true);
  if (query) { filter = "all"; game = "all"; runFilter = "all"; const rf = document.getElementById("run-filter"); if (rf) rf.value = "all"; syncChips(); }
  update();
  if (query) {
    const first = document.querySelector("#view-ach li.item:not(.hidden)");
    const top = (first || document.getElementById("view-ach")).getBoundingClientRect().top + window.scrollY - document.querySelector(".topbar").offsetHeight - 12;
    window.scrollTo({ top, behavior: "auto" });
  }
}
searchEl.addEventListener("input", () => runSearch(searchEl.value));
searchEl.addEventListener("keydown", e => { if (e.key === "Enter") searchEl.blur(); if (e.key === "Escape") { searchEl.value = ""; runSearch(""); } });
clearEl.addEventListener("click", () => { searchEl.value = ""; runSearch(""); searchEl.focus(); });
const toTop = document.getElementById("totop");
let ticking = false;
window.addEventListener("scroll", () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { toTop.classList.toggle("show", window.scrollY > 500); ticking = false; }); }, { passive: true });
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
mainEl.addEventListener("toggle", e => { const d = e.target; if (d.matches && d.matches("details.chapter") && d.open) renderChapter(d.dataset.ch); }, true);
mainEl.addEventListener("click", e => {
  const t = e.target.closest("button, a[data-jump]");
  if (!t) return;
  if (t.classList.contains("tab")) setTab(t.dataset.tab);
  else if (t.dataset.filter) { filter = t.dataset.filter; syncChips(); update(); }
  else if (t.dataset.game) { game = t.dataset.game; syncChips(); update(); }
  else if (t.dataset.kind) { kindFilter = t.dataset.kind; syncChips(); updateColl(); }
  else if (t.id === "hide-got") { hideGot = !hideGot; syncChips(); updateColl(); }
  else if (t.id === "expand") { const open = t.getAttribute("aria-pressed") !== "true"; t.setAttribute("aria-pressed", String(open)); t.textContent = open ? "Hide all guides" : "Show all guides"; document.querySelectorAll("#view-ach .guide-btn").forEach(b => toggleGuide(b, open)); save(); }
  else if (t.classList.contains("guide-btn")) { toggleGuide(t); save(); }
  else if (t.dataset.pad) { state.pad = t.dataset.pad; save(); render(); }
  else if (t.dataset.jump) { e.preventDefault(); jumpTo(t.dataset.jump); }
});

function syncChips() {
  document.querySelectorAll("[data-filter]").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.filter === filter)));
  document.querySelectorAll("[data-game]").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.game === game)));
  document.querySelectorAll("[data-kind]").forEach(c => c.setAttribute("aria-pressed", String(c.dataset.kind === kindFilter)));
  const h = document.getElementById("hide-got"); if (h) h.setAttribute("aria-pressed", String(hideGot));
}
function syncPad() { document.querySelectorAll("[data-pad]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.pad === state.pad))); }

const flat = h => String(h || "").replace(/<[^>]+>/g, " ");
function matches(a) {
  const d = !!state.got[a.id];
  if (filter === "todo" && d) return false;
  if (filter === "done" && !d) return false;
  if (filter === "missable" && !(a.tags || []).some(t => t === "missable" || t === "timed")) return false;
  if (game !== "all" && a.game !== game) return false;
  if (runFilter !== "all" && !a.runs.includes(runFilter)) return false;
  if (query && ![a.name, a.desc, flat(GUIDES[a.id])].join(" ").toLowerCase().includes(query)) return false;
  return true;
}

const isGot = it => it.ach ? !!state.got[it.ach] : !!state.coll[it.key];
function updateColl() {
  const got = CITEMS.filter(isGot).length;
  const cc = document.getElementById("coll-count"); if (cc) cc.textContent = `${got} / ${CITEMS.length}`;
  const totals = {};
  CITEMS.forEach(i => { (totals[i.k] = totals[i.k] || [0, 0])[1]++; if (isGot(i)) totals[i.k][0]++; });
  const ck = document.getElementById("coll-kinds");
  if (ck) ck.innerHTML = Object.keys(KIND_LABEL).filter(k => totals[k]).map(k => `${KIND_PLURAL[k]} <b>${totals[k][0]}/${totals[k][1]}</b>`).join(" · ");
  COLL.forEach(ch => {
    const items = ch.sections.flatMap(s => s.items), g = items.filter(isGot).length, kc = {};
    items.forEach(i => { (kc[i.k] = kc[i.k] || [0, 0])[1]++; if (isGot(i)) kc[i.k][0]++; });
    document.querySelector(`[data-chcount="${ch.key}"]`).textContent = `${g} / ${items.length}`;
    document.querySelector(`[data-chmeta="${ch.key}"]`).innerHTML = Object.keys(KIND_LABEL).filter(k => kc[k]).map(k => `<span>${KIND_PLURAL[k]} <span class="kd">${kc[k][0]}/${kc[k][1]}</span></span>`).join("");
    document.getElementById("ch-" + ch.key).classList.toggle("full", g === items.length);
  });
  document.querySelectorAll(".ci").forEach(el => {
    const on = el.dataset.ci ? !!state.coll[el.dataset.ci] : !!state.got[el.dataset.ciach];
    el.classList.toggle("got", on);
    const cb = el.querySelector("input.check"); if (cb) cb.checked = on;
    el.classList.toggle("hidden", (kindFilter !== "all" && el.dataset.k !== kindFilter) || (hideGot && on));
  });
}

function update() {
  const per = Object.fromEntries(PARTS.map(p => [p.key, [0, 0]]));
  SECTIONS.forEach(sec => {
    let sd = 0, vis = 0;
    sec.items.forEach(a => {
      const d = !!state.got[a.id];
      per[a.game][1]++; if (d) { per[a.game][0]++; sd++; }
      const li = document.getElementById("a-" + a.id);
      li.classList.toggle("done", d);
      const cb = document.getElementById("c-" + a.id);
      cb.checked = d;
      const rule = AUTO.find(r => r.ach === a.id && !r.min);
      cb.indeterminate = !d && !!rule && autoGot(rule) > 0;
      const al = li.querySelector("[data-autoline]");
      if (al && rule) al.innerHTML = `${esc(rule.label)} ticked in the <a href="#coll-top" data-jump="coll">100% Guide</a>: <b>${autoGot(rule)} / ${autoTotal(rule)}</b>`;
      const show = matches(a); li.classList.toggle("hidden", !show); if (show) vis++;
    });
    document.querySelector(`[data-sub="${sec.id}"]`).textContent = `${sd} / ${sec.items.length}`;
    document.querySelector(`[data-jcount="${sec.id}"]`).textContent = `${sd}/${sec.items.length}`;
    document.querySelector(`[data-empty="${sec.id}"]`).hidden = vis > 0;
    document.getElementById("sec-" + sec.id).hidden = vis === 0 && (game !== "all" || runFilter !== "all" || !!query);
  });
  const sc = document.getElementById("search-count");
  if (sc) { const n = ALL.filter(matches).length; sc.textContent = query ? `${n} found` : ""; let nm = document.getElementById("no-match"); if (!nm) { nm = document.createElement("p"); nm.id = "no-match"; nm.className = "empty"; document.getElementById("view-ach").appendChild(nm); } nm.hidden = !(query && n === 0); nm.textContent = "No achievements match that search."; }
  let runsDone = 0;
  RUNS.forEach(r => {
    let g = 0;
    r.tasks.forEach((_, i) => { const on = !!state.tasks[`${r.id}:${i}`]; if (on) g++; document.getElementById(`t-${r.id}-${i}`).checked = on; document.querySelector(`[data-task="${r.id}:${i}"]`).classList.toggle("got", on); });
    const ach = ALL.filter(a => a.runs.includes(r.id)), ag = ach.filter(a => state.got[a.id]).length;
    const full = g === r.tasks.length; if (full) runsDone++;
    document.querySelector(`[data-runsub="${r.id}"]`).textContent = `${g} / ${r.tasks.length} tasks`;
    document.querySelector(`[data-runprog="${r.id}"]`).textContent = `${g}/${r.tasks.length} tasks · ${ag}/${ach.length} achievements`;
    document.querySelector(`[data-runcard="${r.id}"]`).classList.toggle("full", full);
  });
  document.getElementById("runs-count").textContent = `${runsDone} / ${RUNS.length} done`;
  document.querySelectorAll("[data-tl]").forEach(l => l.classList.toggle("done", !!state.got[l.dataset.tl]));
  updateColl();
  const done = Object.values(per).reduce((s, v) => s + v[0], 0), total = Object.values(per).reduce((s, v) => s + v[1], 0), pct = Math.round(done / total * 100);
  document.getElementById("count").innerHTML = `${done} / ${total} <small>unlocked · ${pct}%</small>`;
  document.getElementById("bar").innerHTML = PARTS.map(p => `<span data-p="${p.key}" style="width:${per[p.key][0] / total * 100}%"></span>`).join("");
  document.getElementById("legend").innerHTML = PARTS.map(p => `<span data-p="${p.key}"><i></i>${esc(p.label)} ${per[p.key][0]}/${per[p.key][1]}</span>`).join("");
  document.getElementById("bar").setAttribute("aria-valuenow", pct);
}

/* ---------------- panel ---------------- */
let statusTimer = null;
function status(msg) { const el = document.getElementById("save-status"), d = el.dataset.d || (el.dataset.d = el.textContent); el.textContent = msg; clearTimeout(statusTimer); statusTimer = setTimeout(() => { el.textContent = d; }, 4500); }
document.getElementById("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 1)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "re7-progress.json";
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  status("Backup saved as re7-progress.json.");
});
const fileInput = document.getElementById("import-file");
document.getElementById("import").addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const f = fileInput.files[0]; if (!f) return;
  f.text().then(txt => { const d = JSON.parse(txt); if (!d || typeof d !== "object" || !d.got || typeof d.got !== "object") throw new Error(); state = clean(d); save(); render(); status("Backup restored."); })
    .catch(() => status("That file isn't a checklist backup. Choose a re7-progress.json file."));
  fileInput.value = "";
});

render();
})();
</script>
</body>
</html>
```
