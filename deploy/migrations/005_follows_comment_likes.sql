CREATE TABLE IF NOT EXISTS artist_follows (
 artist TEXT NOT NULL,
 visitor_key TEXT NOT NULL,
 created INTEGER NOT NULL,
 PRIMARY KEY (artist,visitor_key)
);
CREATE INDEX IF NOT EXISTS artist_follows_visitor ON artist_follows(visitor_key);
CREATE TABLE IF NOT EXISTS comment_likes (
 comment_id TEXT NOT NULL REFERENCES content_comments(id) ON DELETE CASCADE,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 created INTEGER NOT NULL,
 PRIMARY KEY (comment_id,member_id)
);
CREATE INDEX IF NOT EXISTS comment_likes_comment ON comment_likes(comment_id);
