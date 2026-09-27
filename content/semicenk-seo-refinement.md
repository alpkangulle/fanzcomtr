# Semicenk SEO and desktop refinement — 2026-09-27

Concert metadata now uses artist, city, event type and a Turkish date; descriptions identify the venue, documented time and ticket source. Six news pages have individually written titles/descriptions. Album, EP and single pages distinguish release information from the 46 individual song pages. Titles are reflected in visible page headings and structured data. All 93 pilot routes have exactly one H1 and distinct title/description pairs. Canonicals and URLs are retained; sitemap modification times reflect the SEO revision.

Desktop fixes are scoped to the Semicenk pilot: reset the relative-position navigation offset that overlapped the article, and stretch the hero photograph to its container without the orange gap. Mobile keeps its existing sticky navigation and square photo.

Validation: production build/TypeScript, all 93 HTTP routes, unique titles/descriptions, single H1, indexability, sitemap membership and parseable JSON-LD passed. Chromium screenshots and geometry checks at 1440px, 1920px and 390px passed, with no horizontal overflow or navigation/article overlap. Desktop and mobile screenshots were visually reviewed. Browser libraries were extracted into the QA directory without altering system packages.

No production content changes are needed. The existing editorial import receipt prevents reapplying the initial content seed. Activate with deploy/activate-release.sh, which backs up the database and performs service health checks.
