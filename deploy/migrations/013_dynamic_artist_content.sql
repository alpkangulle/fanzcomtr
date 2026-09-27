CREATE TABLE artist_songs (
 artist TEXT NOT NULL, slug TEXT NOT NULL, data TEXT NOT NULL CHECK(json_valid(data)),
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 revision INTEGER NOT NULL DEFAULT 1, updated INTEGER NOT NULL,
 PRIMARY KEY(artist,slug)
);
CREATE TABLE artist_live_videos (
 artist TEXT NOT NULL, id TEXT NOT NULL, title TEXT NOT NULL,
 series TEXT NOT NULL DEFAULT '', publisher TEXT NOT NULL DEFAULT '',
 source TEXT NOT NULL, checked_at TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 revision INTEGER NOT NULL DEFAULT 1, updated INTEGER NOT NULL,
 PRIMARY KEY(artist,id)
);
ALTER TABLE artist_entries ADD COLUMN event_status TEXT NOT NULL DEFAULT 'scheduled' CHECK(event_status IN ('scheduled','cancelled','postponed','rescheduled'));
ALTER TABLE artist_entries ADD COLUMN event_country TEXT NOT NULL DEFAULT 'TR';
ALTER TABLE artist_entries ADD COLUMN event_timezone TEXT NOT NULL DEFAULT 'Europe/Istanbul';
ALTER TABLE artist_entries ADD COLUMN previous_date TEXT NOT NULL DEFAULT '';
ALTER TABLE artist_entries ADD COLUMN release_name TEXT NOT NULL DEFAULT '';
ALTER TABLE artist_entries ADD COLUMN release_format TEXT NOT NULL DEFAULT '';
ALTER TABLE artist_entries ADD COLUMN release_credits TEXT NOT NULL DEFAULT '';
ALTER TABLE artist_entries ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE artist_entries ADD COLUMN seo_description TEXT NOT NULL DEFAULT '';
CREATE TABLE content_seed_receipts (name TEXT PRIMARY KEY, applied INTEGER NOT NULL);
