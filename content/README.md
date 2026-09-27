# Semicenk editorial pilot

Research checked 2026-09-27. Original Turkish editorial prose; factual release data from Apple's Turkish catalog (artist 1581975222), videos matched to https://evarecords.com.tr/projeler and the official netd music Yana Yana video. EVA's default project years/upload dates were not used. Biography: TV8 competitor archive and Kral artist biography. Tek Yürek background: Söz Müzik, 2026-06-01. Concert listings: linked Bubilet sessions; conflicting Harbiye start times explicitly disclosed.

Scope: 30 artist releases, 46 distinct tracks, 46 matched official videos, 6 archive news items, 3 announced concerts. This is a dated verified catalog snapshot, not a promise to include every guest performance, remix or live recording. No full lyrics reproduced. One licensed December 2024 interview photo plus official release artwork, clearly separated.

content/semicenk-editorial.json seeds the editable biography and artist_entries. lib/semicenk-catalog.json enriches song pages with factual credits, duration, official links and original notes. Existing entry IDs, entry slugs and the six original song URLs remain stable. Üzülmedim Ki is deduplicated to its earliest single; both release tracklists link to the same song.

Activation: deploy/activate-release.sh backs up the database, migrates and invokes deploy/import-semicenk.py before switching releases. The importer is transactional and idempotent. A digest receipt prevents subsequent deployments from reapplying this package after an editor changes the content. It refuses changed revisions instead of overwriting an editor's intervening work. A failed release health check rolls back code; additive editorial content is compatible with the preceding release and remains in the database. The database backup is available for an intentional content restore.

Future updates must update the source manifest and song enrichment together, preserving canonical slugs. News dates are historical release dates, never automatically rewritten to today's date.
