# Search indexing review - October 8, 2026

## Report and live evidence

The supplied Search Console export reports 19 indexed URLs and 12 exclusions:
five canonical alternatives, three redirects, two noindex pages, and two
discovered/currently not indexed pages. Its latest chart date is October 3.
The export does not include affected URLs, so counts alone cannot identify
which URLs belong to each exclusion category.

All 17 current sitemap URLs were checked live on October 8. Every URL returned
200 at its canonical HTTPS address, declared a matching canonical, and had no
HTML or HTTP-header noindex rule. Missing URLs correctly returned 404.
The live robots file allowed all sitemap pages. Checkout and sandbox had
intentional noindex tags and were absent from the sitemap.

The September audit identified Pricing and AI Dictation for Mac as the two
discovered/currently not indexed URLs. Both still pass today's public technical
checks. Confirm today's affected URLs in Search Console before treating that
older mapping as current. Google-selected canonicals and crawl dates require
Search Console inspection; public HTTP checks do not establish indexed status.

## Changes

- Redirect explicit index.html requests and the www hostname to the existing
  canonical HTTPS URLs using Hostinger/LiteSpeed-compatible rewrite rules.
  Query parameters are preserved, including Paddle transactions and app returns.
- Allow sandbox crawling so Google can read its intentional noindex tag.
  Crawling permission does not make the sandbox indexable.
- Add a contextual homepage link to the Mac dictation guide.
- Extend the built-page checks to catch crawler blocks, checkout URLs in the
  sitemap, and missing deployment rewrite rules.

## Validation and follow-up

Production build and SEO checks passed for 17 pages and 599 internal references.
Local Apache response tests passed for canonical pages, www/index.html redirects,
query preservation, checkout URLs, and missing pages.

After the GitHub-to-Hostinger deployment, check the actual live redirects and
robots file. In Search Console, inspect the two discovered URLs, run Test Live
URL, and request indexing if their canonical destinations are still pending.
Canonical alternatives, redirects, and intentionally excluded checkout pages
do not need to become independently indexed. Re-submit the sitemap if Google
has not processed the current 17 URLs. No indexing result is guaranteed by these
changes, and no Search Console action has been performed in this review.
