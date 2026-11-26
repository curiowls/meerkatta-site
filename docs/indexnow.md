# IndexNow deployment integration

MeerKatta uses IndexNow alongside `sitemap.xml`. The sitemap remains the complete inventory of canonical public pages. IndexNow sends a notification only when a sitemap-listed HTML page is added, updated, or removed.

## Verification key

The verification file is committed at `public/9084875F-2271-4957-88C3-82EEDA1AF021.txt`. Vite copies it to the deployed site root:

`https://meerkatta.com/9084875F-2271-4957-88C3-82EEDA1AF021.txt`

The key is public by design and is not a credential, so no GitHub or Hostinger secret is required.

## Deployment order

`npm run build` writes the current Git commit to `deployment-version.txt` and includes it in `dist`. After a push to `main`, the GitHub workflow:

1. Compares the pushed commit with its predecessor.
2. Selects changed public HTML and generated localized routes from both revisions, including deleted pages. A page-specific catalog edit selects that locale's affected page; shared catalog copy selects its six main pages. Shared renderer/config edits include all potentially affected public HTML, including English language navigation and alternates.
3. Waits until `https://meerkatta.com/deployment-version.txt` matches the pushed commit.
4. Confirms that the verification key is publicly available.
5. Sends the changed URLs in one POST to the global IndexNow endpoint.

This prevents a notification from racing ahead of Hostinger's GitHub deployment. Unrelated scripts, styles, images, private checkout pages, and other non-indexable files do not produce an IndexNow submission. Localization source changes are an exception because they generate or transform public HTML; generated locale files need not be tracked in Git. Formatting-only catalog changes are ignored.

The route config for each Git revision is loaded as its self-contained ES module, so route additions/removals use that revision's actual language/page definitions. Keep this config free of filesystem/network side effects and external imports. Invalid config or catalog JSON fails selection instead of silently skipping URLs.

## Operations

The workflow is `.github/workflows/indexnow.yml`. Its run log lists every submitted URL and the IndexNow HTTP status. HTTP 200 means accepted; a first submission may return HTTP 202 while the key is verified.

If Hostinger takes longer than ten minutes to deploy, the workflow fails without submitting stale pages. Re-run the failed GitHub Action after the production deployment finishes.

To inspect a commit range locally:

```sh
npm run indexnow:urls -- <before-commit> <after-commit>
npm run check:indexnow
```
