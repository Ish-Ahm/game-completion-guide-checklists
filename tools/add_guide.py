#!/usr/bin/env python3
"""Add a new guide to the site in one go.

Usage (from the project root):
  python3 -I tools/add_guide.py checklists/newgame.html --title "New Game" --bar "#ff8800" [--pos "center 30%"] [--dry-run]

Does, in order:
  1. checks the guide (storage key, progress readout, no favicon of its own)
  2. injects (or refreshes) the shared hub:head / hub:body blocks, copied from vanquish.html
  3. adds a GAMES entry to index.html (uses img/cards/<slug>.webp if it exists)
  4. adds the card image to FILES in sw.js and bumps the CACHE version
Re-running on the same guide refreshes the blocks and does not add a second card.
"""
import argparse, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "checklists" / "vanquish.html"
HEAD = ("<!-- hub:head -->", "<!-- /hub:head -->")
BODY = ("<!-- hub:body -->", "<!-- /hub:body -->")
READOUT = re.compile(r"(\d[\d,]*)\s*(?:/|of)\s*(\d[\d,]*)\s*(?:unlocked|done|collectibles)")


def block(text, marks):
    a, b = text.index(marks[0]), text.index(marks[1]) + len(marks[1])
    return text[a:b]


def replace_or_insert(text, marks, new, anchor):
    """Replace an existing block, or insert one just before `anchor` (last occurrence)."""
    if marks[0] in text and marks[1] in text:
        return text.replace(block(text, marks), new, 1)
    i = text.rfind(anchor)
    if i < 0:
        sys.exit(f"error: no {anchor} in the guide")
    return text[:i] + new + "\n" + text[i:]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("guide", help="path to the guide, e.g. checklists/newgame.html")
    ap.add_argument("--title", required=True, help="name shown on the home card")
    ap.add_argument("--bar", default="#7cc4ff", help="progress bar colour (hex)")
    ap.add_argument("--pos", default="", help='card image crop, e.g. "center 30%%" (optional)')
    ap.add_argument("--dry-run", action="store_true", help="check and report, change nothing")
    a = ap.parse_args()

    guide = Path(a.guide)
    if not guide.is_absolute():
        guide = (Path.cwd() / guide).resolve()
    if guide.parent != ROOT / "checklists" or guide.suffix != ".html":
        sys.exit("error: the guide must be a .html file inside checklists/")
    slug = guide.stem
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        sys.exit("error: use a lowercase file name with letters, numbers and hyphens, e.g. newgame.html")
    if not re.fullmatch(r"#[0-9a-fA-F]{3,8}", a.bar):
        sys.exit("error: --bar must be a hex colour like #ff8800")
    if not guide.is_file():
        sys.exit(f"error: {guide} does not exist")

    text = guide.read_text(encoding="utf-8")
    ref = REF.read_text(encoding="utf-8")
    problems = []

    m = re.search(r'const KEY\s*=\s*"([^"]+)"', text)
    if not m:
        sys.exit('error: no `const KEY = "..."` line found. The guide must define its storage key that way.')
    key = m.group(1)
    if not re.search(r"-v\d+$", key):
        problems.append(f'storage key "{key}" does not end in -v<number>, so cross-device sync will ignore it')
    if not READOUT.search(re.sub(r"data:[a-z/+-]+;base64,[A-Za-z0-9+/=]+", "", text)):
        problems.append('no readout like "7 / 46 unlocked" found in the static HTML (fine if the page builds it with JavaScript, but check the home progress bar works after ticking an item)')
    body_only = text.split(HEAD[0])[0] if HEAD[0] in text else text
    if re.search(r'<link[^>]*rel="[^"]*icon', body_only):
        problems.append("the guide has its own favicon link; remove it so the shared tab icon is used")

    # 2. hub blocks
    new = replace_or_insert(text, HEAD, block(ref, HEAD), "</head>")
    new = replace_or_insert(new, BODY, block(ref, BODY), "</body>")

    # 3. home page entry
    index_p, sw_p = ROOT / "index.html", ROOT / "sw.js"
    index = index_p.read_text(encoding="utf-8")
    card = ROOT / "img" / "cards" / f"{slug}.webp"
    entry = f'  {{ file: "checklists/{slug}.html", title: {json.dumps(a.title, ensure_ascii=False)}, key: "{key}"'
    if card.is_file():
        entry += f', art: "img/cards/{slug}.webp"'
    else:
        problems.append(f"no card image at img/cards/{slug}.webp yet; the card will be text-only until you add it (then re-run this)")
    if a.pos:
        entry += f', pos: "{a.pos}"'
    entry += f', bar: "{a.bar}" }}'
    gm = re.search(r"const GAMES = \[\n(.*?)\n\];", index, re.S)
    if not gm:
        sys.exit("error: could not find the GAMES array in index.html")
    games = gm.group(1)
    line_re = re.compile(r'^\s*\{ file: "checklists/%s\.html".*$' % re.escape(slug), re.M)
    if line_re.search(games):
        old_line = line_re.search(games).group(0)
        games_new = games.replace(old_line, entry + ("," if old_line.rstrip().endswith(",") else ""), 1)
        action = "updated existing home card"
    else:
        games_new = games.rstrip() + ",\n" + entry
        action = "added home card"
    index_new = index[:gm.start(1)] + games_new + index[gm.end(1):]

    # 4. service worker
    sw = sw_p.read_text(encoding="utf-8")
    sw_new = sw
    art = f'"img/cards/{slug}.webp"'
    if card.is_file() and art not in sw:
        sw_new = re.sub(r'(const FILES = \[.*?)(\n\];)', lambda mm: mm.group(1).rstrip().rstrip(",") + ",\n  " + art + mm.group(2), sw_new, count=1, flags=re.S)
    cm = re.search(r'const CACHE = "checklists-v(\d+)";', sw_new)
    if cm:
        sw_new = sw_new.replace(cm.group(0), f'const CACHE = "checklists-v{int(cm.group(1)) + 1}";', 1)
    else:
        problems.append("could not find CACHE in sw.js; bump it by hand")

    print(f"Guide: checklists/{slug}.html   key: {key}")
    print(f"- hub blocks: {'refreshed' if HEAD[0] in text else 'injected'}")
    print(f"- {action}: {entry.strip()}")
    print(f"- sw.js: cache {'bumped to v%d' % (int(cm.group(1)) + 1) if cm else 'unchanged'}{', card added to FILES' if sw_new != sw and art in sw_new and art not in sw else ''}")
    for p in problems:
        print("! " + p)
    if a.dry_run:
        print("(dry run: nothing written)")
        return
    guide.write_text(new, encoding="utf-8")
    index_p.write_text(index_new, encoding="utf-8")
    sw_p.write_text(sw_new, encoding="utf-8")
    print("Done. Next: git add -A, commit, git push, then check the card, the guide and the All games button.")


if __name__ == "__main__":
    main()
