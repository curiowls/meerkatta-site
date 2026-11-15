# Full homepage: local review

The approved `world-prototype` commit (`0b5a21c`) is merged into local `main`.
The owner approved committing and pushing the homepage integration and localization.

## Source of truth

- `world/home.html`: shared body, derived from the approved prototype. All nine
  languages use the same scene, demos, disclosures, pricing, FAQ and downloads.
- `i18n/home/en.json`: English copy and reference for the template's stable keys.
- `i18n/home/{locale}.json`: complete contextual translations, including examples
  and accessible labels. Asset markup and common navigation labels are shared.
- `i18n/home.mjs`: server-rendered metadata, localized links and page composition.
- `world/home.css` and `world/home.js`: navigation and multilingual layout support.
- `world/world.css`, `world/world.js`, `world/scene.js`: approved scene and motion.

The localization plugin now renders `/` and the eight localized roots with this
shared renderer during both development and production builds. The old root
`index.html` remains as the Vite entry file; its previous, unrelated in-progress
headline and rail changes are preserved, not included in the new homepage.
Do not edit that old body to change the new homepage.

“In the making” and the future audio/video FAQ are omitted. Field-note links stay;
their destinations remain English and are identified as such. Non-homepage
localized routes retain their existing implementation.

## Review

Use the running source preview, not `file://` or an old build preview. Review the
language picker at the top, both capture tabs, expanded setup guidance, dictation
example, personal-voice example, pricing, FAQs and download links. The two Chinese
versions use their regional vocabulary; Japanese and Korean use natural local
phrasing; Brazilian Portuguese is not a European Portuguese conversion.

## Scope boundary

Homepage changes are the new files listed above, the three integration lines in
`i18n/render.mjs`, a small mobile disclosure fix in `world/world.js`, and dedicated
homepage tests. Keep the earlier accessibility/checkout/SEO work, the nine old
catalog skip-link additions, package changes, field-note drafts, and their tests
separate when preparing commits. The existing tests for the previous homepage
are retained for that work; `world-home.spec.mjs` covers the replacement.

Review approval includes the Watch reconstruction, annotated Ohlalarm example,
compact language picker, and restored field-note summaries in all nine languages.
The Ohlalarm reference uses source=meerkatta, medium=referral,
campaign=voice_example and content=homepage UTM parameters.

## Verification (November 14, 2026)

- Production build and 42 unit tests passed.
- 33 dedicated homepage browser tests passed across Chromium, Firefox and WebKit.
  Every language was checked at 320, 390, 768, 1101, 1280 and 1440px widths.
- Language switching, mobile navigation, capture tabs, setup disclosures and
  no-JavaScript content were checked. These are browser tests, not physical-device tests.
- SEO validation passed for 67 sitemap pages and 3,986 internal links/assets.
- Desktop/mobile screenshots were inspected. Canvas samples had 41–46 distinct
  colors across 49 sample points and changed with scrolling; the scene was not blank.
- Unrelated working changes remain separate from the homepage release.

Local source preview: http://127.0.0.1:5192/ (language selector in the header).
