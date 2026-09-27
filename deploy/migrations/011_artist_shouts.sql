CREATE TABLE artist_shouts (
 id TEXT PRIMARY KEY,
 artist TEXT NOT NULL,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 body TEXT NOT NULL CHECK(length(body) BETWEEN 3 AND 180),
 created INTEGER NOT NULL,
 deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX artist_shouts_artist_created ON artist_shouts(artist,created DESC);
CREATE INDEX artist_shouts_recent ON artist_shouts(created DESC) WHERE deleted=0;
CREATE INDEX artist_shouts_member_created ON artist_shouts(member_id,created DESC);
