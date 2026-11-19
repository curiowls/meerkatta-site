# Modern Web Audit: MeerKatta

November 11, 2026, America/Los_Angeles. Audit only: no application code,
dependencies, account settings, or hosting configuration changed.

November 12 implementation follow-up: the six priority fixes are implemented
and locally verified. See [implementation and test results](modern-web-fixes-2026-11-12.md).
The findings below remain the original audit snapshot.

## Summary

Keep the static multi-page Vite architecture. It provides crawlable HTML,
usable static demo fallbacks, canonical language routes, and small baseline
scripts without needing a site-wide React runtime. React/Remotion is isolated
to the enhanced demos. A framework migration, SPA rewrite, PWA, or service
worker is not justified by the findings.

The main work is targeted: patch the build tool, fix keyboard/motion/assistive
technology gaps, make checkout failures recoverable, and add release checks.
The deployed homepage is already fast in the fresh mobile lab run.

## Scope And Evidence

- Working tree based on `72dcc3ba9460025462a73474213a87a6f7514434`; existing
  unpublished IndexNow work and the email-demo copy correction were preserved.
- Current source, generated HTML, production build, dependency tree, public
  response headers, Chrome keyboard/DOM checks, and a fresh live mobile
  Lighthouse run. No payment or live interest vote was submitted.
- Requested Modern Web Guidance plugin: searched with its current npm CLI and
  retrieved `accessibility`, `performance`, `motion`, `html`,
  `lazy-load-video-and-audio`, and `navbar`. The installed wrapper reported an
  older September skill version; current CLI guidance was retrieved rather than
  modifying the plugin installation. Reported latest guide version: November 9.
- [Machine-readable browser and performance evidence](audits/2026-11-11-modern-web-evidence.json).
- Lab and source evidence are not physical-device, VoiceOver/NVDA, field CWV,
  production API security, or actual payment/fulfillment certification.

## Prioritized Findings

### 1. Patch The Installed Vite Toolchain

**Priority: first maintenance task. Confidence: confirmed dependency advisory.**

`package.json:18` permits patched releases, but `package-lock.json:1124` and the
installed tree still resolve Vite 6.4.3. `npm audit` reports one high-severity
vulnerable package covering five advisories. `npm audit --omit=dev` reports zero
known vulnerable production packages.

The high launch-editor advisory is Windows-specific. A separate non-Windows
file-disclosure advisory requires an exposed development server and particular
project path/import conditions. The deployed LiteSpeed static site is not a
Vite development server; this is not evidence that visitors or production data
are compromised. Local configuration does not intentionally expose the dev server.

**Action:** update the lockfile and minimum Vite version to the current patched
6.4.x release, 6.4.6 as verified in npm during this audit. Keep the existing
dependency overrides under review; do not force a major Vite/framework upgrade
to resolve a patch-level issue. Rebuild and rerun the audit.

Sources: [Windows advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm),
[non-Windows advisory and exposure conditions](https://github.com/advisories/GHSA-rq7h-c2jc-7f22).

### 2. Invisible Homepage Navigation Remains Keyboard-Focusable

**Priority: fix soon. Confidence: browser-reproduced.**

`style.css:237` hides `.section-anchor-rail` with opacity and pointer-events,
but its links in `index.html:272` stay in the keyboard and accessibility order.
At the initial desktop homepage, the 15th Tab focused "Capture anywhere" while
the rail's computed opacity was 0. The user gets an invisible focus stop.

**Action:** remove the rail from interaction while hidden, using `inert` or
equivalent visibility/focus management. Restore it when displayed and avoid
hiding it while a descendant holds focus. Add a keyboard regression test.
Also add a visible-on-focus skip-to-content link to the common site shell;
currently the first eight Tab stops traverse the repeated header. Existing
landmarks help screen-reader navigation, so absence of a skip link alone is
not treated here as proof of total WCAG bypass-block nonconformance.

### 3. The Rotating Headline Has No Pause Mechanism

**Priority: fix soon. Confidence: source and browser controls confirmed.**

`motion.js:123` rotates headline phrases every 3.8 seconds indefinitely while
visible. Reduced-motion users receive a static phrase, which is good, but other
users cannot stop the headline. The adjacent story pause button only pauses its
own player; there is no headline control.

**Action:** make the headline static, or provide a keyboard-accessible pause
mechanism that actually stops this rotation. Do not treat reduced-motion support
as a replacement for control of auto-updating content. Keep phrase dimensions
reserved to preserve the current layout stability.

Source: [W3C Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).

### 4. Checkout Has No Lifecycle Error Or Close Recovery

**Priority: fix soon. Confidence: source and isolated execution confirmed.**

`pay/pay.js:61` initializes Paddle without `eventCallback`; `pay/pay.js:126`
opens checkout without a synchronous exception boundary. The page checks for a
missing SDK, but asynchronous provider errors, checkout closure, or a stalled
load leave the underlying page saying "Opening secure checkout..." without a
retry action. Isolated execution confirmed no event callback is configured.

The earlier missing default-payment-link account issue was separately fixed and
verified. This finding is about future failure recovery, not a claim that live
checkout remains broken.

**Action:** handle loaded/error/closed events and safe SDK exceptions; show a
neutral recoverable message and a deliberate retry button. Do not automatically
loop checkout attempts or log customer/account query parameters. Preserve the
approved price map, metadata, `_ptxn` behavior, and validated app-return flow.
Add mocked lifecycle tests and sandbox browser smoke tests; never infer license
fulfillment from the welcome-page query string.

Source: [Paddle checkout events](https://developer.paddle.com/paddle-js/events/).

### 5. Enhanced Work Demos Expose A Stale Screen-Reader Fallback

**Priority: fix soon. Confidence: DOM/accessibility-tree content confirmed.**

`stories.jsx:86` provides an accessible transcript for the selected work example.
However, `style.css:3160` only visually clips the original static fallback.
After choosing Email, the accessible content contains both the email transcript
and the original team-message fallback from `index.html:335`.

**Action:** when the work demo mounts, hide its redundant fallback from assistive
technology, since it already has a dedicated current transcript. Restore the
fallback if enhancement fails. Do not globally hide all story fallbacks: the
hero story currently relies on its static fallback as its accessible alternative.
Test the Email and AI-prompt states with the accessibility tree and VoiceOver.

### 6. Browser And SEO Checks Are Not A Pull-Request Gate

**Priority: next release-hardening task. Confidence: repository-confirmed.**

The only repository workflow is `.github/workflows/indexnow.yml`, triggered by
pushes to main. The build runs useful source/unit checks, but the SEO validator,
PHP integration suite, and browser keyboard/responsive/recovery checks are not
all part of a PR validation gate. Hostinger may reject a failed build, but that
is not equivalent to testing browser behavior before merging.

**Action:** add a PR workflow with a supported pinned Node version, `npm ci`,
build, SEO validation, targeted PHP tests, and browser smoke tests. Cover keyboard
focus, mobile navigation, pricing links, consent withdrawal, demo alternatives,
and mocked/sandbox checkout failure paths. Keep live-payment actions out of CI.
Add a public post-deploy smoke check separate from IndexNow acceptance.

## Smaller Improvements

- **Consent focus restoration:** `public/analytics-consent.js:129` hides the
  choice panel without returning focus to its opener. Reopening preferences
  focuses Allow; dismissing No thanks left `document.activeElement` on BODY in
  Chrome. Restore the preferences trigger when applicable. Keep the initial
  banner nonblocking; a native modal dialog is not automatically the right UI
  for first-visit consent. Do not change the explicit opt-in privacy boundary.
- **FAQ progressive enhancement:** `main.js:9` exclusively controls answers
  initially marked hidden; the same pattern is emitted by `i18n/render.mjs:11`.
  Answers cannot be opened if that JavaScript fails. Consider native
  details/summary or readable-by-default content that collapses only after
  enhancement. This is a source-derived resilience gap, not a new live outage.
- **Fonts and shared CSS:** `index.html:33` requests three Google font families
  in a blocking stylesheet. Fresh Lighthouse still identifies that request and
  the shared CSS as blocking dependencies. Consider licensed same-origin WOFF2
  subsets and a modest common/page CSS split, preserving multilingual coverage.
  Only preload fonts actually needed above the fold; do not preload every weight.
- **Cache policy:** sampled hashed CSS receives seven-day caching; MP4 receives
  no explicit Cache-Control. Use longer immutable caching for content-hashed
  assets. Version media URLs before assigning a long lifetime. Keep HTML
  revalidatable and `/api/`/checkout responses out of broad caching rules.
- **Response hardening:** sampled HTML/CSS/media responses have only
  `Content-Security-Policy: upgrade-insecure-requests`, without an explicit
  script/frame policy or HSTS/nosniff headers. The PHP API separately sends
  nosniff/no-store. Start a report-only CSP and verify Paddle, consented GA,
  fonts, inline JSON-LD, and demo styles before enforcing. Audit subdomains
  before applying HSTS includeSubDomains or preload. No exploit is claimed.

## Modernization Opportunities, Not Required Rewrites

1. Consolidate the shared English/localized header, footer, metadata and product
   facts through the existing build-time template helpers. This reduces drift
   without requiring a SPA or replacing contextual translations.
2. Consider replacing straightforward in-browser demo animations with small
   native CSS/JS components only if profiling justifies it. The current demo
   chunk is about 440.6 KB raw / 139.9 KB gzip, but now loads on visibility; its
   size is not an initial-mobile-load regression in the fresh audit. Preserve
   the approved illustrations, pause controls, transcripts and fallback content.
3. Document an actual browser support matrix, prioritizing iOS/Safari for this
   audience. Vite's JavaScript targets are not a complete CSS/API support policy.
4. Native popovers can add Escape/light-dismiss to mobile navigation as an
   enhancement, but existing details/summary is a valid lightweight fallback.
   View Transitions and scroll-driven animation are optional polish, not current
   priorities. Native video lazy loading is not supported across all Safari and
   Firefox targets in the retrieved guidance; retain preload/observer fallbacks.

## Verification Results

- Fresh live mobile Lighthouse 12.8.2 / Chrome 136: **performance 99,
  accessibility 100, best practices 100, SEO 100**. LCP 1.78 s, TBT 0 ms,
  CLS 0, initial transfer 319,643 bytes; no run warnings. One simulated run,
  not a field Core Web Vitals or INP assessment. Do not treat score 100 as
  complete accessibility/security certification.
- No initial story-bundle or capture-MP4 request in this fresh mobile run.
  This confirms the deployed loading behavior, not a causal claim that all LCP
  improvement versus the earlier run came from one change.
- Production build and all 20 bundled analytics/localization/pricing/performance
  tests pass. All 10 pending IndexNow selector tests pass.
- SEO validator passes 66 sitemap pages and 3,770 internal references.
- Isolated PHP suite passes persistence, withdrawal, duplicate protection,
  origin/payload/method rejection, concurrent writes and rate limiting.
- Capture MP4 contains video only, no audio track. Existing text setup/capture
  instructions provide an alternative; missing audio captions were therefore
  not reported as an audio-accessibility defect.
- Consent gating, sanitized analytics URLs, checkout analytics exclusion,
  escaped localized output, native mobile disclosure, deferred media, explicit
  demo controls and reduced-motion handling are useful existing safeguards.
- No physical-device Safari/Firefox run, VoiceOver/NVDA session, full penetration
  test, or real payment/license-issuance test was performed in this audit.

## Suggested Execution Order

1. Patch Vite within 6.4.x and confirm a clean dependency audit.
2. Fix hidden navigation focus, headline pause behavior, and work-demo alternatives
   together; add keyboard and accessibility-tree regression tests.
3. Add checkout lifecycle recovery and sandbox failure tests.
4. Add PR/post-deploy gates; keep the pending IndexNow changes separate and review
   them before release.
5. Improve font/cache/header delivery conservatively, measuring the live site
   afterward. Consolidate templates incrementally when touching shared content.
