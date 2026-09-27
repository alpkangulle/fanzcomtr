# Semicenk archive — source check 27 September 2026

Scope: verified artist releases and guest recording, selected career milestones, available concert announcements. This is not a claim of every historical appearance or every news article.

## Coverage
- 30 existing artist releases retained; 47 distinct studio songs after adding Bir Anda Düşüverdim.
- 7.65 belongs to Doğu Swag. Only the guest song is added; its album link resolves to Apple Music, not a fictitious Semicenk album page.
- 13 original news articles: six existing release stories plus seven career/event stories.
- Eight concert records: four upcoming (İzmir, İstanbul, Ankara, Kocaeli), three historical program records, one canceled Oberhausen concert.
- Four Eva Records Live At Harbiye videos, verified through YouTube oEmbed publisher/title. Performance dates are not inferred.
- Biography extended with 2023/2024 awards, 2023 Spotify Turkey results, guest track and Sen Kaldın television use.

## Sources and limits
New records carry direct source URLs in semicenk-archive.json. Music metadata cross-checked against the iTunes Turkey search export (200-result artist search), Apple Music and Eva Records official video. The only additional artist-credited studio title identified against the original 46-song catalog was Bir Anda Düşüverdim.
- Turbinenhalle's own page explicitly cancels the 27 September 2026 event. Older aggregator listings are superseded. 17:00 is doors, not stage time; no performance time or refund policy is invented.
- Bubilet artist listing has duplicate sessions; four unique upcoming dates retained. Kocaeli session 291760: 28 November 2026, 20:00.
- 9 August 2026 festival date: Biletino https://biletino.com/tr/e-1c5t/yildiz-tilbe-semicenk-istanbul-festivali/; occurrence reported by DHA on 10 August.
- Bursa 8 August 2026 and Istanbul Festival 16 August 2025 are explicitly historical announcements, not inferred post-event reports.
- Kanal D/teve2 official award videos support category/winner. Ceremony dates cross-checked with contemporary press.
- Spotify figures are limited to 2023 Turkey, attributed through MediaCat's 29 November 2023 report.
- No unverified recent song rumors, guessed concert years, live renditions counted as new studio tracks, or invented concert photographs.

## Behavior
- Canceled event has a distinct section, explicit heading and source CTA; it is excluded from upcoming cards and homepage.
- Event JSON-LD uses EventCancelled and country DE for Oberhausen. Missing stage times remain date-only.
- Past concert SEO uses archive wording rather than current ticket availability.
- Song structured data includes credited collaborators and external guest-album URL.
- News archive date labels no longer imply every story is a music release. Cover credit resolves to the actual album source, or the licensed artist photo.
- Existing three upcoming concert summaries now use readable Turkish dates.
- SEO revision advances sitemap lastmod. Existing public URLs are preserved.

## Deployment
Run deploy/activate-release.sh as root after reviewing the built release. It creates a database backup, applies the existing seed once, applies this incremental seed atomically, then switches and health-checks the service.
The incremental import refuses changed editorial revisions and rolls back the whole transaction on conflict. Digest receipts preserve later admin edits on repeat activation.
Tests use copied databases only; production data is unchanged until activation.

## Validation
Production build/type checking passed. A 106-page HTTP audit passed status, unique titles/descriptions, single H1, indexability, sitemap and canonical checks. JSON-LD parses on all pages. Specific checks passed for canceled-event status/country/no-ticket CTA, four upcoming events, external guest-album destination, and no empty internal album link.
Browser checks at 1440, 1920 and 390 pixels passed hero/navigation geometry and horizontal overflow. New concert archive, canceled detail, gallery and guest-song pages were inspected at desktop/mobile sizes.
Importer replay produced no duplicate writes; a simulated concurrent biography edit caused full rollback without overwriting the edit.
