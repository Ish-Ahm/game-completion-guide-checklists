# TL;DR: after Claude makes a new guide

For you (the owner), not for the Claude project. The full requirements for building a guide are in `CHECKLIST-SPEC.md` Part 1; the manual version of the steps below is in its Part 2.

1. **Save the files.** Guide in `checklists/` (e.g. `checklists/newgame.html`). Card picture in `img/cards/newgame.webp` (920 x 430, same name as the guide). Banner and logo pictures are optional.
2. **Tell Claude Code to add it**, in one message: *"Add the new guide `newgame.html`, Steam appid 123456, title "New Game", bar colour #ff8800."* (The appid is the number after `/app/` in the game's Steam store link.)
3. **Claude Code does the rest:** adds the home page card and the shared buttons and sync scripts, links the guide to Steam so unlocked achievements tick automatically, and reports any achievement names that did not match.
4. **Give it the version number** when it asks. It shows the previous version and you choose the new one (a new guide is usually a minor bump, e.g. 1.3.3 to 1.4.0).
5. **Publish:** run `git add -A`, then `git commit -m "Add New Game guide"`, then `git push` from the project folder. Wait for the green tick on Cloudflare, then reload the site with Ctrl+Shift+R.
6. **Quick check:** the card shows on the home page, the guide opens, "← All games" goes back, and your Steam achievements are ticked.

If something looks off, tell Claude Code what you see. There is a short "if something looks wrong" list at the end of `CHECKLIST-SPEC.md`.
