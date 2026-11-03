# Website Localization

## First Rollout

English remains at the existing URLs. Spanish, Simplified Chinese, Traditional
Chinese, Japanese, German, French, Korean, and Brazilian Portuguese have dedicated
URLs for Home, About, Pricing, Use Cases, Getting Started, and Help. This matches
the app interface list in `localization/AppLanguage.swift`, plus `pt-BR` for the
website. This change does not add Portuguese to the app itself.

The localized pages are contextual adaptations of the main product journey,
not sentence-by-sentence copies of the longer English pages. Keep the distinction
between dictation, capturing an unfinished thought, and returning to it later.
Do not translate the brand name, provider identifiers, plan query values, or app
control names that users need to recognize on an English screen.

Journal articles, detailed use-case articles, legal policies, website checkout,
and its default payment confirmation remain English in this rollout. Links from
localized pages identify English content before navigation. Existing product
recordings are retained and captioned as English app previews. Do not create
localized URLs for untranslated pages.

## Sources And Build

- `i18n/locales/*.json`: editable copy; `en.json` is the coverage/schema reference.
- `i18n/render.mjs`: localized layouts and the Vite HTML integration.
- `i18n/config.mjs`: language list, paths, and alternate URLs.
- `i18n/client.js`: explicit language selection and localized welcome behavior.
- `i18n/styles.css`: shared language control and responsive localized layouts.

Starting Vite or building generates the ignored language directories in the site
root. Do not edit those derived HTML files. Restart Vite after changing a catalog
or template. Production builds add the 48 localized URLs to `dist/sitemap.xml`;
the checked-in public sitemap remains the English source list.

Each translated page has static HTML, its own canonical, reciprocal `hreflang`
links, and English `x-default`. There are no location-based or browser-language
redirects. The selector preserves the equivalent page, query, and fragment. On an
English-only article or policy, another language leads to that language's homepage.
Without JavaScript, a language link list is available at the bottom of the page.

Pricing keeps USD amounts and approved `/pay/?plan=...` links. The Paddle contract,
price map, discount, app trial, and account metadata are unchanged. The localized
welcome page can display payment confirmation when visited with `checkout=success`
and supports the `meerkatta` and `meerkatta-debug` app return schemes.

## Validation

Run `npm run check:localization`, `npm run build`, and
`python3 scripts/check-seo.py`. The language parity check reads the adjacent app
checkout when present; it skips that comparison on a deployment machine without
the app repo. Check desktop/mobile layouts, long European headings, CJK fonts,
language switching on subpages, ordinary tips entry, and payment return separately.
Native-speaker editorial review is recommended before wider regional promotion;
automated tests verify coverage and behavior, not native linguistic approval.
