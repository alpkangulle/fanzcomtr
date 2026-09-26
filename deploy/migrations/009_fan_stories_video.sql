ALTER TABLE fan_posts ADD COLUMN media_url TEXT NOT NULL DEFAULT '';
ALTER TABLE fan_posts ADD COLUMN media_kind TEXT NOT NULL DEFAULT 'text' CHECK(media_kind IN ('text','photo','video'));
CREATE TABLE IF NOT EXISTS fan_stories (
 id TEXT PRIMARY KEY,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 body TEXT NOT NULL DEFAULT '',
 media_url TEXT NOT NULL DEFAULT '',
 media_kind TEXT NOT NULL DEFAULT 'text' CHECK(media_kind IN ('text','photo','video')),
 theme TEXT NOT NULL DEFAULT 'dark' CHECK(theme IN ('dark','lime','violet')),
 created INTEGER NOT NULL,
 expires INTEGER NOT NULL,
 deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS fan_stories_active ON fan_stories(expires,created DESC);
CREATE TABLE IF NOT EXISTS fan_post_views (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 post_id TEXT NOT NULL REFERENCES fan_posts(id) ON DELETE CASCADE,
 created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS fan_post_views_post ON fan_post_views(post_id);
