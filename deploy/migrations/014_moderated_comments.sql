CREATE TABLE page_comments (
 id TEXT PRIMARY KEY,
 target TEXT NOT NULL,
 member_id TEXT REFERENCES members(id) ON DELETE CASCADE,
 guest_name TEXT NOT NULL DEFAULT '',
 actor_key TEXT NOT NULL DEFAULT '',
 body TEXT NOT NULL,
 created INTEGER NOT NULL,
 updated INTEGER NOT NULL,
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
 deleted INTEGER NOT NULL DEFAULT 0
);
INSERT INTO page_comments(id,target,member_id,body,created,updated,status,deleted)
 SELECT id,target,member_id,body,created,created,'approved',deleted FROM content_comments;
CREATE INDEX page_comments_public ON page_comments(target,status,deleted,created DESC,id);
CREATE INDEX page_comments_actor ON page_comments(actor_key,created DESC);
CREATE TABLE page_comment_likes (
 comment_id TEXT NOT NULL REFERENCES page_comments(id) ON DELETE CASCADE,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 created INTEGER NOT NULL,
 PRIMARY KEY(comment_id,member_id)
);
INSERT INTO page_comment_likes SELECT comment_id,member_id,created FROM comment_likes;
CREATE VIEW approved_page_comments AS SELECT * FROM page_comments WHERE status='approved' AND deleted=0;
