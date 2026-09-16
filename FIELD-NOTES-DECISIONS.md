# Field notes: scan and read

Use six previews per batch in Scan, two full notes per batch in Read, and an explicit Load more button. Default to Scan. There are currently four notes, so Scan shows all four and Read initially shows two. Counts are an editorial starting point, not a universal research finding; notes are roughly 250–350 words, so two make a short reading session. Revisit counts when content length or library size changes.

NN/g describes the accessibility, location and footer problems with automatic infinite scrolling, and the tradeoffs of user-triggered Load more: https://www.nngroup.com/articles/infinite-scrolling-tips/ . This supports controlled loading, but does not establish an ideal count for short essays. Baymard's product-list research is adjacent evidence, not a direct basis for essay counts: https://baymard.com/research-articles/number-of-items-loaded-by-default .

The sticky Scan/Read control stays within the notes region. Scan uses lightweight server-delivered summaries. Read fetches canonical HTML notes on demand, caches them for the page lifetime, and adds two on request. Counts and mode are reflected in the URL, so reloads restore the loaded range. Switching mode retains the currently visible note where practical. Load more moves keyboard focus to the first newly revealed heading without scrolling away from the control unexpectedly. Fetch failures retain the permalink and offer retry. All canonical notes remain usable without JavaScript and are in the sitemap.

Numbered pagination is unnecessary for four notes. If the archive grows enough that browsing a specific date/topic matters, add filtering and server-rendered archive pages while preserving canonical note URLs. Do not switch to automatic infinite scroll merely because the archive grows.

# Future-feature hook
The homepage uses a compact dark-brown vision panel after the FAQ and before Field notes, labeled In the making with a separate Not available in the current release notice. Its brief vision is to preserve context and intent when showing is more useful than words. The detailed exploratory scope lives in a short field note, not a launch promise. Removed current-video implications from the homepage pricing bullet and FAQ.

# Vote endpoint and hosting
`public/api/interest.php` runs on PHP 8.1+ without a database extension. Deploy `dist` to the existing PHP-capable hosting web root. Storage defaults to `meerkatta-interest-private` alongside (not inside) that root. The PHP process needs write permission there. Alternatively set `MEERKATTA_INTEREST_DIR` to an absolute private directory outside the web root. The endpoint refuses storage inside the web root. Keep that private directory across deployments and include it in backups.

The endpoint accepts GET for this browser's vote and POST for an explicit interest/withdrawal. Only meerkatta.com and www.meerkatta.com origins can write in production. Do not set `MEERKATTA_DEV_ORIGIN` in production. HTTPS cookies are HttpOnly/SameSite Strict. The cookie contains a random identifier; only a keyed digest is stored. No email or raw IP is collected by this endpoint. Short-lived keyed IP hashes enforce 30 writes/day, and a stable file lock plus atomic replacement prevents lost concurrent updates. This is a directional interest signal, not an identity-verified poll; clearing cookies can allow another vote. No public total is displayed.

To inspect the total privately, count entries in the `votes` object in `votes.json`; do not publish that file or its secret. A failed server request never produces a success message in the UI. Hosting logs remain governed by hosting configuration separately from this endpoint.

Local development: run `npm run dev:api` plus `npm run dev -- --host 127.0.0.1 --port 5199`. Vite proxies /api to PHP on port5202. Local vote storage is /tmp/meerkatta-interest-dev, separate from production. `python3 tests/interest-api.py` starts isolated PHP servers with temporary storage and verifies persistence, deduplication, withdrawal, invalid requests, concurrent writes, and rate limiting.

Deployment still requires the existing Hostinger publishing route/access; local tests do not establish production availability.
