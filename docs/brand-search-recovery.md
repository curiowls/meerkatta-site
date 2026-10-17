# MeerKatta branded search recovery

## Objective and baseline

The objective is for the official website to appear on the first page of Google
for the unquoted query `MeerKatta`. Bing first-page visibility is user-reported;
it does not establish Google visibility. Record country, date, device, and whether
Google silently changes the query when comparing results.

The October 16, 2026 Search Console screenshots show the non-www homepage indexed,
last crawled October 7. Six www alternatives and four redirecting URLs are excluded
as expected. Two non-www articles are discovered but not indexed, while their www
counterparts appear in the indexed report:

- https://meerkatta.com/journal/return-to-what-you-capture/
- https://meerkatta.com/journal/speak-a-useful-first-draft/

Public HTTP checks show the non-www destinations return 200 with matching
self-canonicals and no noindex. The www versions return permanent redirects to
them. Google-selected canonicals require URL Inspection; public checks cannot
establish when Google will consolidate them or why it ranks a result.

## Website changes

- State the brand, AI dictation, thought capture, and supported platforms in the
  homepage title, description, social metadata, and visible introductory copy.
- Preserve the existing hero headline and product story. Make the exact brand
  name visible in the hero eyebrow as well as the logo.
- Connect the existing website and software structured data, and identify
  Lugugul Design as the software publisher. Link the About founder note to the
  publisher's actual website. Do not invent reviews, profiles, or ratings.
- Check branded, unique page titles and reject www URLs in internal references
  and sitemap entries during the existing built-site SEO audit.
- Preserve the existing permanent redirects and self-canonicals. Excluded
  duplicates and checkout pages should not become independent search results.

## Official references

The public release repository is https://github.com/curiowls/meerkattasparkle.
Give it the homepage https://meerkatta.com/ and a description that identifies the
app, then put a brief product introduction and website/download links before the
existing update-feed documentation. Preserve release assets and appcast.xml.

Lugugul's current source already contains a featured MeerKatta product entry and
website link on `/products`. Verify https://lugugul.com/products after that site's
own deployment; no extra backlink directory or duplicate landing page is needed.

## Verified implementation and search evidence - October 16

- Website changes published to GitHub main in `f77e72f`; build, typography,
  18-page SEO checks, and 634 internal references pass. Desktop and narrow mobile
  previews show the new introductory copy without text overflow.
- Release-repository README published in `afbcd1c`. Its public description now
  identifies MeerKatta as AI dictation and thought capture for Mac and iPhone;
  its homepage is https://meerkatta.com/.
- Search Console URL Inspection confirms the homepage is indexed, with
  https://meerkatta.com/ as Google's selected canonical. Last recorded crawl:
  October 7, 2026, 4:30:21 AM, Googlebot smartphone. The live URL test passed on
  October 16. Manual Actions and Security Issues both report no issues detected.
- Performance, Web search, September 17 through October 14, filtered to queries
  containing `meerkatta`: zero reported clicks and impressions. Filtered query
  reports can omit low-volume data; this is a measurement baseline, not proof
  that nobody searched for the name.
- The user's existing Google search for unquoted `meerkatta` explicitly displays
  "These are results for meerkat" with "Search instead for meerkatta."
  Following that control shows the official homepage as the first organic
  result, followed by About, Use Cases, Thought Capture, Pricing, and Custom
  Vocabulary. The AI Overview also describes the actual app. These results are
  personalized; they do not prove the default search has stopped correcting
  the spelling or establish rankings for every user/location.
- The remaining ranking problem is therefore primarily query correction in the
  observed search, despite recognition of the exact-spelling product. Keep
  building consistent official product references; do not rename the product,
  stuff keywords, buy links, or manufacture searches/clicks.
- Direct production HTTP requests from this machine timed out after publication,
  but Google's fresh live homepage test at 6:21 PM fetched the newly published
  title, description, and Open Graph metadata. This independently confirms
  deployment of the homepage changes through Google's fetched HTML. The exact
  production deployment marker was not retrieved.
- Live tests passed for both pending non-www articles. Search Console confirmed
  "Indexing requested" for both articles and for the updated homepage. They were
  added to Google's priority crawl queue; acceptance does not prove reindexing.
- The sitemap report shows Success, last read October 15, with all 18 pages
  discovered. A duplicate sitemap submission was unnecessary.

## Search Console actions after deployment

Use the Domain property for `meerkatta.com` if available, so www and non-www
versions can be inspected together.

1. Confirm the homepage and the two articles pass Test Live URL. Record the
   indexed report's user-declared canonical, Google-selected canonical, last
   crawl, and referring sitemap for each URL.
2. Request indexing for the updated homepage and the two non-www articles.
   Submit or refresh https://meerkatta.com/sitemap.xml if needed. Avoid repeated
   daily submissions; they do not speed up crawling.
3. Check Manual Actions and Security Issues for explicit warnings. Save the
   actual result; do not infer a clean report from an HTTP 200.
4. Export a baseline from Performance > Search results for the last 28 days,
   filtered to queries containing `meerkatta`, Web search. Inspect query spelling
   and the homepage row. Track impressions, clicks, CTR, and average position.
5. Review once a week and after Google records a crawl of the new homepage.
   Compare the same country/device where possible. If a fresh crawl still shows
   no branded impressions, inspect rendered HTML and selected canonical, then
   assess official product mentions and links before adding more content.

## Completion evidence

Build and crawl checks verify the implementation. GitHub confirmation verifies
publication to the repository. The production marker and live HTML verify
Hostinger deployment. None of these proves Google ranking.

Completion requires the official domain visibly appearing in the first ten
organic results for the unquoted `MeerKatta` query, with the search date and
location recorded. Search Console branded-query data provides supporting evidence
of sustained visibility. Do not mark the ranking objective complete based only on
an indexing request, an indexed URL, Bing results, or a research search provider.

## References

- https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- https://developers.google.com/search/docs/appearance/site-names
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
