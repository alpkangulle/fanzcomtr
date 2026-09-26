CREATE TABLE IF NOT EXISTS members (
 id TEXT PRIMARY KEY,
 username TEXT NOT NULL COLLATE NOCASE UNIQUE,
 password_hash TEXT NOT NULL,
 created INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS member_sessions (
 token_hash TEXT PRIMARY KEY,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 expires INTEGER NOT NULL,
 created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS member_sessions_expires ON member_sessions(expires);
CREATE TABLE IF NOT EXISTS content_likes (
 target TEXT NOT NULL,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 created INTEGER NOT NULL,
 PRIMARY KEY (target,member_id)
);
CREATE TABLE IF NOT EXISTS content_comments (
 id TEXT PRIMARY KEY,
 target TEXT NOT NULL,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 body TEXT NOT NULL,
 created INTEGER NOT NULL,
 deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS content_comments_target_created ON content_comments(target,created DESC);
