CREATE TABLE artist_entries (
 id TEXT PRIMARY KEY,
 artist TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('haberler','konserler','albumler')),
 slug TEXT NOT NULL,
 title TEXT NOT NULL,
 summary TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL DEFAULT '',
 date TEXT NOT NULL,
 time TEXT NOT NULL DEFAULT '',
 city TEXT NOT NULL DEFAULT '',
 venue TEXT NOT NULL DEFAULT '',
 url TEXT NOT NULL DEFAULT '',
 source TEXT NOT NULL DEFAULT '',
 cover TEXT NOT NULL DEFAULT '',
 tracks TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 revision INTEGER NOT NULL DEFAULT 1,
 updated INTEGER NOT NULL,
 UNIQUE(artist,kind,slug)
);
CREATE INDEX artist_entries_public ON artist_entries(artist,kind,status,date);
