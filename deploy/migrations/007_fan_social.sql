CREATE TABLE IF NOT EXISTS fan_profiles (
 member_id TEXT PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
 bio TEXT NOT NULL DEFAULT '',
 avatar TEXT NOT NULL DEFAULT '',
 updated INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS fan_posts (
 id TEXT PRIMARY KEY,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 body TEXT NOT NULL,
 image TEXT NOT NULL DEFAULT '',
 created INTEGER NOT NULL,
 deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS fan_posts_created ON fan_posts(created DESC);
CREATE INDEX IF NOT EXISTS fan_posts_member ON fan_posts(member_id,created DESC);
CREATE TABLE IF NOT EXISTS fan_follows (
 follower_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 followed_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 created INTEGER NOT NULL,
 PRIMARY KEY(follower_id,followed_id)
);
CREATE INDEX IF NOT EXISTS fan_follows_followed ON fan_follows(followed_id);
CREATE TABLE IF NOT EXISTS fan_post_likes (
 post_id TEXT NOT NULL REFERENCES fan_posts(id) ON DELETE CASCADE,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 created INTEGER NOT NULL,
 PRIMARY KEY(post_id,member_id)
);
CREATE TABLE IF NOT EXISTS fan_post_comments (
 id TEXT PRIMARY KEY,
 post_id TEXT NOT NULL REFERENCES fan_posts(id) ON DELETE CASCADE,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 body TEXT NOT NULL,
 created INTEGER NOT NULL,
 deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS fan_post_comments_post ON fan_post_comments(post_id,created DESC);
