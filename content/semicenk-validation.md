# Semicenk pilot validation — 2026-09-27

- Production build and TypeScript check passed (Next 16.3.4).
- 93 Semicenk routes returned HTTP 200 with canonical URLs, descriptions and indexable metadata; all appeared in the sitemap.
- The six existing song URLs and three existing entry URLs were retained. Duplicate Üzülmedim Ki -2 route correctly returns 404.
- Song / album / article / event / breadcrumb JSON-LD parses successfully.
- All 46 official YouTube links resolve through YouTube oEmbed.
- All 30 cover URLs return HTTP 200 with image content types.
- Biography and 39 entry imports completed on an isolated production snapshot.
- Repeat import is idempotent; a receipt preserves later editor changes during subsequent deployments.
- Concurrent editor revision changes cause an atomic rollback rather than an overwrite.
- Other artists' editorial rows match the original database exactly.
- Sezen Aksu, Mabel Matiz song and health endpoints passed regression requests.
- Screenshot/browser-layout verification could not run: the server Chromium installation lacks libatk-1.0.so.0. No screenshot-based visual pass is claimed.
- Production database and active release have not been changed by these checks.

Activation uses deploy/activate-release.sh, with the existing backup, migration, service health checks and code rollback. Content remains compatible with the preceding release if a code rollback is necessary.
