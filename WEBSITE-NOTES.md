# Website storytelling and onboarding

## Run and build

Use Node.js 20+ and run `npm ci`, then `npm run dev`. `npm run build` produces the static site in `dist/`. Upload the **contents** of `dist/` to the existing site document root using the established deployment process. Preserve existing server configuration and take a backup before replacement.

The repository's GitHub Pages configuration currently publishes the older `dual-mode` branch. The custom domain is served by Hostinger; pushing this source branch does not publish meerkatta.com.

## What changed

- Home: two silent, on-screen Remotion stories show unfinished speech becoming structured text. They play once, pause off-screen, provide pause/replay and immediate-result controls, and honor reduced motion. Static text remains available if JavaScript fails and to assistive technology.
- Capture: two matching real-app demonstrations show widget setup (13.8 seconds), then capture (13 seconds). They play sequentially with exclusive playback, below-video captions and controls, posters, progress indicators, and a text description. No audio or automatic looping.
- Use cases: four iPhone/Mac and inspiration/focus paths, each with a real situation, steps, a starter prompt, and a return cue. Query links preselect the workflow; the selection carries into welcome.
- Welcome: default onboarding is visible without checkout. Device-specific setup and selected workflow instructions sit alongside the existing checkout confirmation.
- Field notes: three initial practice articles, navigation, homepage entry points, and sitemap entries. No subscriber collection or tracking was added.

## Media provenance

`public/media/widget-setup.mp4` is edited from the user-provided `/Users/chelchel/Documents/ScreenRecording_09-16-2026 11-10-09_1.MP4`. It removes redundant scrolling/waiting and the unrelated suggested-widget gallery, then holds the installed widget state.

`public/media/lock-capture.mp4` uses the original segments behind the user-provided `meerkatta-app-preview-30s-no-music.mp4`: `marketing/app-store/preview-build-122/public/{lockscreen.png,lock-capture.mp4,capture.mp4,processing.mp4,result.png}`. Original recordings are `MK Lockscreen Capture.MP4` and `MeerKatta_mainflow.mov`. Sequence: 1 second Lock Screen hold, 2 seconds opening, 5 seconds capture, 2 seconds processing, 3 seconds result. Pauses were shortened; this is not a speed benchmark.

Both outputs are 540×1170,30fps,H.264 and have no audio or baked-in frame/captions. Source project and Shotcraft editorial plan are in `video-source/`. Run npm install there, then npm run prepare-media and npm run render. Source paths refer to the original recordings on the authoring machine. Final outputs are web-optimized with `ffmpeg -an -c:v copy -movflags +faststart` after rendering.
The two text stories are illustrative examples, not screen recordings or measured AI outputs. Shotcraft informed the single-action narrative and readable final hold; its code/assets were not copied. Remotion/React versions are pinned in package-lock.json.

## Verification

Production build and whitespace checks pass. Browser checks cover all four workflow selections and tailored welcomes, checkout confirmation/deep link, real video playback, story playback/replay/instant result, narrow layout with no horizontal overflow, and final-frame text fit. All 18 built HTML routes were checked for local link/asset/anchor targets with zero missing targets. An independent static review found two issues (native pause retention and selected steps); both are fixed.

Reduced-motion behavior has been reviewed in code; the available browser did not expose OS preference emulation. Deployment and public-domain verification remain pending confirmation of the existing Hostinger publishing route. Pricing and checkout logic are retained from the source site.
