# Database-backed artist content

Status: built and tested in release 20260927-content-db; activation is a separate one-time operation.

## Content model
Migration 013 adds artist_songs and artist_live_videos. Each record has draft/published/archived visibility, a revision and updated timestamp. Song JSON stores the existing public metadata shape; it is database data, not bundled application code.
artist_entries gains event_status (scheduled/cancelled/postponed/rescheduled), event_country, event_timezone (IANA), previous_date, release_name, release_format, release_credits, seo_title and seo_description. Publication status and event status are separate.

The one-time seed copies the exact 47 existing song records, four official live videos and existing release/event metadata. It does not replace titles, bodies, URLs or editor revisions. A receipt prevents replay from overwriting later content edits. Legacy JSON files remain migration fixtures only; application code no longer imports them.

Artist server routes fetch a fresh serializable catalog from SQLite. Client gallery/home/guide components share this payload. Song pages, video embeds, song counts and sitemap read database content on every request. Canceled/postponed events leave the upcoming feed and expose a status-source CTA. Structured data includes status, country, time-zone offset and previous date on rescheduling.

## Automation interface
Use the current activated release's deploy/update-artist-content.py. Never run migration or deployment from the scheduled content task.

Batch structure:
{
  "artist": "semicenk",
  "operations": [
    {
      "type": "entry",
      "id": "existing-entry-id",
      "expectedRevision": 2,
      "values": {"event_status": "cancelled"}
    }
  ]
}

Allowed operation types:
- entry: existing id and exact expectedRevision; partial values from the script's allowlist. New entries require expectedRevision null, kind, slug, title and date. Set status published explicitly when ready. Album entries should include release_name, release_format and release_credits.
- song: slug, expectedRevision (null for new), status and complete values matching CatalogSong. albumId/albumSlug must refer to the matching artist album; guest recordings use externalAlbumUrl. Duration is seconds, position is a positive integer, videoId is an 11-character YouTube ID or null. Preserve existing slugs. Synchronize an album's track list when adding/removing tracks.
- video: id (YouTube ID), expectedRevision and title, publisher, source, checked_at; optional series, position, status.
- biography: expectedRevision and biography/sources. Sources are newline-separated HTTPS URLs.

Run with DATABASE_PATH set to the intended database:
python3 deploy/update-artist-content.py /absolute/path/batch.json --dry-run
python3 deploy/update-artist-content.py /absolute/path/batch.json

Dry-run validates input and revisions without writes. Apply creates a SQLite backup in the database directory's content-backups folder, then commits the entire batch atomically. Concurrent revision changes roll back the batch. Keep expected revisions from a fresh read; never invent/increment them to bypass a conflict.

After apply, verify the public page, title/description, source, video and relevant structured data. A scheduled task reports published only after this verification. No build/restart is needed for supported content writes. Keep source URLs and check timestamps in task state. The task must not edit code, schema, server settings or start paid services.

## Activation and rollback
Activate once using deploy/activate-release.sh as root. It backs up the database, applies migrations and seed, switches the release, restarts and health-checks. New columns/tables are additive, so the former release remains compatible if code is rolled back. Restore a database backup only deliberately, accounting for any later user activity; do not automatically discard subsequent member data.

## Validation
- Production build and TypeScript pass.
- All 106 existing Semicenk paths: status 200, one H1, unique SEO titles/descriptions, parseable structured data and sitemap coverage.
- Existing 47 song payloads preserved byte-for-value after JSON parsing; four video records preserved.
- Existing desktop/mobile geometry checks pass at 1440, 1920 and 390 pixels.
- tests/dynamic-content.py uses a running isolated QA server and copied database. It confirms song creation and gallery video edit visible immediately without restart, sitemap update, canceled/postponed/rescheduled states and previous date, Berlin winter offset, dry-run no writes, conflict atomicity and seed replay preserving edits.
- Test fixtures are removed/restored in finally; no test content is inserted into production.
