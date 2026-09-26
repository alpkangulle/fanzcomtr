ALTER TABLE channel_guests ADD COLUMN avatar TEXT NOT NULL DEFAULT '';
ALTER TABLE channel_guests ADD COLUMN last_profile INTEGER NOT NULL DEFAULT 0;
ALTER TABLE channel_presence ADD COLUMN role TEXT NOT NULL DEFAULT 'guest' CHECK(role IN ('guest','member','moderator','admin'));
ALTER TABLE channel_presence ADD COLUMN member_id TEXT NOT NULL DEFAULT '';
ALTER TABLE channel_messages ADD COLUMN role TEXT NOT NULL DEFAULT 'guest' CHECK(role IN ('guest','member','moderator','admin'));
ALTER TABLE channel_messages ADD COLUMN member_id TEXT NOT NULL DEFAULT '';
CREATE TABLE IF NOT EXISTS channel_roles (
 artist TEXT NOT NULL,
 member_id TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 role TEXT NOT NULL CHECK(role='moderator'),
 granted INTEGER NOT NULL,
 PRIMARY KEY(artist,member_id)
);
CREATE TABLE IF NOT EXISTS channel_style_entitlements (
 member_id TEXT PRIMARY KEY REFERENCES members(id) ON DELETE CASCADE,
 style TEXT NOT NULL CHECK(style IN ('glow-lime','glow-ice','glow-rose')),
 expires INTEGER NOT NULL,
 granted INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS channel_style_expiry ON channel_style_entitlements(expires);
