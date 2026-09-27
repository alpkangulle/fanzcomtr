# Semicenk final SEO audit — 27 September 2026

Release: 20260927-semicenk-final

## Critical live findings
The HTML metadata was correct, but live responses carried X-Robots-Tag: noindex, nofollow. The build-time SITE_ORIGIN was absent, so next.config.ts emitted the preview restriction into routes-manifest.json. Nginx was not adding this header. The static robots.txt also advertised the former fans.wai.com.tr domain.

Fix: production builds now require an explicit SITE_ORIGIN. This release was built with SITE_ORIGIN=https://fanz.com.tr. robots.txt is dynamic and reads the runtime origin; canonical/robots fallbacks now use fanz.com.tr. Activation rejects a build containing the universal noindex header before switching releases, and checks both public headers and robots.txt after restart.

## Pilot improvements
- Added a sharing image to all seven Semicenk section pages.
- Added page, breadcrumb and relevant list markup to the artist hub and seven sections, using published database entries and songs.
- Reused a consistent Person identifier for Semicenk; a fan page is not misrepresented as the artist's own ProfilePage.
- Removed the hardcoded Article datePublished (2026-09-27). The database does not store a trustworthy first-publication timestamp, so only the recorded dateModified is emitted.
- Used the Turkey calendar date for deciding when concert metadata should become an archive entry.
- Preserved existing bespoke titles/descriptions and stable URLs.

## Verification
Live audit: 106 Semicenk URLs; unique nonempty titles/descriptions, self canonicals, one H1 per page. No orphaned pilot pages or broken internal pilot links. Seven sections lacked sharing images and schema before the patch.

Candidate audit: all 106 URLs passed status, title/description uniqueness, canonical, H1, robots meta AND response-header, sharing-image and parseable schema checks. 106 BreadcrumbLists; 13 Articles; 8 MusicEvents. 141 distinct linked schema/image resources returned HTTP 200. robots.txt follows the candidate runtime origin, with no former-domain reference. Production build manifest has no universal noindex. Admin remains noindex/nofollow, profile remains noindex, and unauthenticated /api/admin/seo returns 401. TypeScript/build, diff checks and activation shell syntax passed. QA used a separate SQLite copy with SEO automation disabled.

Not claimed: a Google Rich Results Test pass, Search Console ownership/URL inspection, Google indexing or ranking. These require Google-side validation after deployment.

## Activate
As root:
bash /home/deploy/fans/releases/20260927-semicenk-final/deploy/activate-release.sh

The current live release remains unchanged until this command runs. The script retains database backup, service restart and automatic code rollback. No content schema migration was added.

## Future builds
SITE_ORIGIN=https://fanz.com.tr npm run build

## Reference guidance
https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
https://developers.google.com/search/docs/appearance/structured-data/article
