# Cross-device sync: one-time Cloudflare setup

Code: `functions/api/sync.js` (server) and `sync.js` (browser). Storage: Cloudflare Workers KV. Free tier is plenty.

1. Cloudflare dashboard, **Storage & databases**, **KV**, **Create instance** (namespace). Name it `checklists-sync`.
2. **Workers & Pages**, the Pages project, **Settings**, **Bindings**, **Add**, **KV namespace**.
   Variable name: `SYNC_KV` (exactly). Namespace: `checklists-sync`. Save.
3. Same Settings page, **Variables and secrets**, **Add**. Type: **Secret**. Name: `SYNC_PASSCODE`. Value: your passcode (long, 3 or 4 random words). Save.
4. **Deployments**, **Retry deployment** (bindings only apply to new deployments).
5. Open the site, tap **Set up sync**, type the passcode. Repeat once on each device.

Notes
- KV is eventually consistent: a change can take up to about a minute to show on another device.
- The passcode is kept in each browser's localStorage (`sync-pass-v1`). Change it by editing the secret, then entering the new one on each device.
- Synced keys: every localStorage key ending in `-v<number>` (all checklist keys, plus `hub-progress-v1`).
