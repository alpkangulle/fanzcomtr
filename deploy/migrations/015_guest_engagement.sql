CREATE TABLE guest_content_likes (
 target TEXT NOT NULL,
 visitor_key TEXT NOT NULL,
 created INTEGER NOT NULL,
 PRIMARY KEY(target,visitor_key)
);
CREATE INDEX guest_content_likes_created ON guest_content_likes(created);
CREATE TABLE guest_page_comment_likes (
 comment_id TEXT NOT NULL REFERENCES page_comments(id) ON DELETE CASCADE,
 visitor_key TEXT NOT NULL,
 created INTEGER NOT NULL,
 PRIMARY KEY(comment_id,visitor_key)
);
CREATE INDEX guest_page_comment_likes_created ON guest_page_comment_likes(created);
