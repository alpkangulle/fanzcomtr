CREATE TABLE IF NOT EXISTS content_view_events (
 target TEXT NOT NULL,
 visitor_key TEXT NOT NULL,
 window_start INTEGER NOT NULL,
 created INTEGER NOT NULL,
 PRIMARY KEY (target, visitor_key, window_start)
);
CREATE INDEX IF NOT EXISTS content_view_events_target ON content_view_events(target);
