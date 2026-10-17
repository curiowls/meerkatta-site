# Search logo and thumbnail

The search-result site icon is the existing MeerKatta app logo, not the mascot.
All pages offer `/favicon.ico` as an unconditional 128-pixel fallback before the
existing light/dark PNG icon links. The existing Google-visible icon files and
their URLs are preserved. The fallback is converted directly from the existing
128-pixel app icon; there is no new logo design.

The homepage offers `/assets/meerkatta-curious-search.jpg` as its Open Graph,
Twitter, software, and WebPage primary image, and permits large image previews
with `max-image-preview:large`. The image is a 1200 x 1200 JPEG. The original
wide social card remains available and continues to serve the other pages.

The user selected the furry 3D curious character. Its source is the product
repository's `brand/character-development/v05/curious.png`. The image-editing tool
prepared a close-up square portrait, retaining the upward gaze and pale studio
background; macOS sips resized and encoded the delivered JPEG. This marketing
crop is a derived asset, not a new character identity or geometry reference.

Bing chooses whether to display a favicon or image thumbnail. Metadata and a
crawlable root icon supply candidates; they cannot force a particular result
layout or immediately replace Bing's cached icon. The existing IndexNow workflow
notifies participating engines of changed public pages after Hostinger deploys
the matching commit. Verify the notification independently of search appearance.

References:

- https://blogs.bing.com/webmaster/2020/4/Announcing-new-options-for-webmasters-to-control-their-snippets-at-Bing/
- https://www.bing.com/webmasters/help/marking-up-your-site-with-structured-data-3a93e731
