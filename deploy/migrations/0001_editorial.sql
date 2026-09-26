CREATE TABLE artist_content (artist TEXT PRIMARY KEY, biography TEXT NOT NULL DEFAULT '', sources TEXT NOT NULL DEFAULT '', updated INTEGER NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
CREATE TABLE admin_login_attempts (bucket TEXT PRIMARY KEY, failures INTEGER NOT NULL DEFAULT 0, window_start INTEGER NOT NULL);
