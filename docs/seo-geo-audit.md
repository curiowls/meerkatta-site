# SEO and AI discovery optimization — September 17, 2026

Status: implementation and local validation complete. Changes remain local for the requested review; publishing and indexing are not claimed.

## Evidence and changes
- 17 indexable static HTML pages in sitemap. Checkout and sandbox have noindex.
- Added BlogPosting and breadcrumbs to four field notes; publication dates derived from visible dates, no invented authors or ratings.
- Added Blog entity to field-note index.
- Corrected annual subscription Offer to $90 billed yearly; added $9 monthly option. Visible pricing remains source of truth.
- Removed stale blanket sitemap dates (July 12) and optional priority/changefreq noise rather than fabricate recency.
- Fixed structured-data logo to a stable public asset instead of a root file renamed by Vite.
- Added scripts/check-seo.py to validate built canonicals, metadata, H1s, JSON-LD syntax, sitemap, and checkout exclusion.
- Live homepage responded 200; a nonexistent path responded 404. Robots permits public crawling. Hostinger/LiteSpeed confirmed from response headers.

## Manual tasks created in existing GTM Task Tracker
All tagged GTM Workstream=MeerKatta, Status=To Do.
- Search Console verification and sitemap: https://app.notion.com/p/3dfd12a39475819392f9f72da9c7187e
- Bing Webmaster Tools: https://app.notion.com/p/3dfd12a394758196a01cd218c0dbde2d
- Verified product facts, authorship, and customer proof: https://app.notion.com/p/3dfd12a3947581e0a411fd44ada5b7b9

## Final verification
- Production build passes; scripts/check-seo.py validates 17 sitemap pages and 598 internal links/media references, including fragment targets.
- All 17 current public sitemap URLs returned HTTP 200 at their canonical HTTPS URLs. A deliberately nonexistent path returned 404. This validates the existing hosting baseline, not deployment of these edits.
- Social preview rendered and visually inspected at 1200 × 630, saved as PNG, and all page metadata points to it.
- Homepage FAQ now gives a direct definition of MeerKatta; visible answer and FAQ schema match. Existing product positioning and concise field-note format are preserved.
- Read back all three Notion follow-ups: checklists and GTM Workstream=MeerKatta verified.
- Public crawling remains allowed; no changes to training-bot preferences. No special AI file is necessary for eligibility.
- No fabricated author credentials, testimonials, ratings, or performance claims added.

## Release handoff
Review locally, then publish through the existing GitHub → Hostinger connection when approved. Do not deploy through another hosting provider. After sync, rerun the URL checks, verify the PNG and updated metadata on production, then complete the Notion verification tasks. Search Console/Bing account verification and customer evidence remain user-owned tasks as requested.

## Sources
https://developers.google.com/search/docs/appearance/ai-features
https://developers.openai.com/api/docs/bots

Google says normal SEO foundations apply to AI features; special AI files or schema are not prerequisites. Public crawler access is separate from training preferences. No ranking, citation, or rich-result guarantee is made.

## Signed-in search console review — September 17, 2026
- Google domain ownership verified; robots.txt valid; Search generative AI set to Include. No visibility setting changes needed.
- Google reports 10 indexed URLs. Exclusions: 6 canonical alternatives, 3 redirects, 2 noindex, and 2 discovered/currently not indexed (Pricing and AI Dictation for Mac).
- Resubmitted the current sitemap successfully to both Google and Bing. Previous processed counts are 12 URLs, pending refresh.
- Pricing and AI Dictation for Mac indexing requests accepted into Google's priority crawl queue.
- Bing has no blocked URLs; Crawl Control remains Default.
- Bing short-title recommendation affects Pricing only. Updated local page/social title to “MeerKatta Pricing — Lifetime and Subscription Plans”. Production build and 598-link SEO checks pass; not deployed.
- Bing IndexNow requires website integration and a live key file; deferred to an approved release. Inbound-link recommendation requires authentic relevant mentions, not a settings change.
- Existing Notion account-setup tasks updated with verified findings; post-release checks remain outstanding.
