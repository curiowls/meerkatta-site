# IndexNow deployment integration

MeerKatta uses IndexNow alongside `sitemap.xml`. The sitemap remains the complete inventory of canonical public pages. IndexNow sends a notification only when a sitemap-listed HTML page is added, updated, or removed.

## Verification key

The verification file is committed at `public/9084875F-2271-4957-88C3-82EEDA1AF021.txt`. Vite copies it to the deployed site root:

`https://meerkatta.com/9084875F-2271-4957-88C3-82EEDA1AF021.txt`

The key is public by design and is not a credential, so no GitHub or Hostinger secret is required.

## Deployment order

`npm run build` writes the current Git commit to `deployment-version.txt` and includes it in `dist`. After a push to `main`, the GitHub workflow:

1. Compares the pushed commit with its predecessor.
2. Selects changed HTML pages that appear in the old or new sitemap, including deleted pages.
3. Waits until `https://meerkatta.com/deployment-version.txt` matches the pushed commit.
4. Confirms that the verification key is publicly available.
5. Sends the changed URLs in one POST to the global IndexNow endpoint.

This prevents a notification from racing ahead of Hostinger's GitHub deployment. Changes to scripts, styles, images, private checkout pages, and other non-indexable files do not produce an IndexNow submission.

## Operations

The workflow is `.github/workflows/indexnow.yml`. Its run log lists every submitted URL and the IndexNow HTTP status. HTTP 200 means accepted; a first submission may return HTTP 202 while the key is verified.

If Hostinger takes longer than ten minutes to deploy, the workflow fails without submitting stale pages. Re-run the failed GitHub Action after the production deployment finishes.

To inspect a commit range locally:

```sh
npm run indexnow:urls -- <before-commit> <after-commit>
```
