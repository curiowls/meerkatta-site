# Six Priority Web Fixes

November 12, 2026, America/Los_Angeles. Follow-up to the
[modern-web audit](modern-web-audit-2026-11-11.md).

## Implemented

1. **Toolchain:** Vite now resolves to 6.4.6. Existing esbuild/source-map-js
   overrides remain unchanged. Playwright is a development-only dependency.
2. **Keyboard navigation:** the homepage section rail is inert while hidden.
   It stays in place while a descendant has focus and updates after focus leaves.
   All 66 sitemap pages receive a localized, visible-on-focus skip link and a
   focusable main-content target through the existing build-time renderer.
3. **Headline motion:** a small pause/resume icon independently controls the
   rotating headline. Reduced motion stays static and hides the unnecessary
   control. Existing layout, phrase-space reservation, and story controls remain.
4. **Checkout recovery:** loaded, error, closed, declined, and completed events
   update the underlying page. Missing/stalled SDK loads and synchronous SDK
   exceptions expose a deliberate retry; no automatic checkout retry loop was
   added. Payment declines keep the provider form open. A completed checkout
   never offers another payment, including after late close/failure events.
   Approved plan prices, live token, account metadata, email prefill, lifetime
   discount, app return scheme, and sandbox-only price overrides are preserved.
   Initial `_ptxn` auto-launch remains SDK-owned; retries reopen that transaction.
5. **Accessible demo alternatives:** enhanced work demos hide the redundant
   static transcript from assistive technology. A blocked import or uncaught
   render failure leaves/restores that fallback. The hero's static alternative
   remains accessible because it is still needed.
6. **Release validation:** `.github/workflows/verify.yml` adds PR/main-push
   validation with Node 24, clean install, high-severity dependency audit, build
   and unit tests, SEO/link checks, isolated PHP tests, and browser regression
   tests. A separate main-push job waits for the matching Hostinger deployment
   marker, then fetches public routes and assets without executing Paddle.

## Local Verification

- `npm ci`: passed; zero known vulnerabilities reported.
- `npm run build`: passed, including typography checks and all 40 unit tests.
- `npm run check:seo`: 66 sitemap pages and 3,836 internal links/assets passed.
- `npm run check:api`: persistence, duplicates, withdrawal, invalid requests,
  concurrent writes, rate limits, and no raw-IP storage passed using temp data.
- `npm run check:browser`: 67 passed, one intentionally skipped. Projects:
  Chromium, Firefox, desktop WebKit, and mobile WebKit. The skipped test concerns
  the section rail, which is not displayed in the mobile layout. Layout checks
  cover 320, 390, 768, and 1440px widths on home, pricing, and getting started.
- `SMOKE_ORIGIN=http://127.0.0.1:5191 npm run check:production`: all six routes,
  their local script assets, and sitemap passed against the local build.
- Workflow YAML syntax and `git diff --check`: passed.
- Chrome visual checks confirmed desktop/mobile layout, visible keyboard skip
  navigation, headline pause/resume, and mobile navigation. Preview is running
  with patched Vite at `http://127.0.0.1:5191/`.

Browser tests block external requests and use a fake Paddle SDK, including for
the sandbox page. They check approved price/account contracts and failure
recovery without charging, contacting a customer, or emitting analytics. macOS
WebKit keyboard tests use Option-Tab to include links with default settings;
see the [Playwright maintainer explanation](https://github.com/microsoft/playwright/issues/5609).

## Boundaries And Deferred Work

At the original November 12 checkpoint, nothing had been committed, pushed, or deployed as part of this implementation.
GitHub Actions and the real post-deployment checks still need to run after push.
No branch protection setting changed; making `verify` a required merge check
is a separate repository setting. Local Node was 25.9.0; CI specifies Node 24.

No actual payment, license fulfillment, real-device Safari, or VoiceOver/NVDA
test was performed. Existing Remotion module-directive build warnings remain;
the build succeeds. These checks do not certify complete accessibility/security.

Consent focus restoration, no-JavaScript FAQ enhancement, font/CSS optimization,
cache/header/CSP changes, and template/framework modernization are deferred.
Existing pending SEO/IndexNow work and the approved email-demo copy were preserved.

## November 18 Release Review

- Vite 6.4.6 shipped separately in `6ee5e83`; this release adds checkout
  recovery, accessibility fixes and validation infrastructure only.
- Browser checks now exercise the approved world homepage, shared menu,
  keyboard-operated device tabs, reduced-motion demo and no-JavaScript fallback.
  Retired headline/Remotion browser scenarios were removed; focused unit tests
  retain coverage for the legacy rail and demo fallback code.
- Fixed a 320px horizontal overflow in the Mac capture preview when external
  fonts are unavailable, by allowing its grid and heading to shrink.
- Clean isolated staging export: install/audit passed with zero known
  vulnerabilities; 35 unit tests passed, with the app-repository language parity
  check skipped because the isolated export does not contain the product repo.
- Production build, 69 sitemap pages, 3,882 local links/assets, temporary-data
  PHP API tests and six-route local HTTP smoke checks passed.
- Browser verification: all 84 header/homepage cases passed across Chromium,
  Firefox, WebKit and mobile WebKit. After correcting three mobile test setup
  assumptions, all 52 checkout/accessibility cases passed in a separate final
  run (136 distinct passing cases in total). The product-repository language
  parity test also passed when run from the normal checkout.
- Editorial drafts, the Mac dictation page revision and IndexNow changes remain
  outside this release. No live payment or license issuance is tested here.
