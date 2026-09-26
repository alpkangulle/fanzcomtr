ALTER TABLE fan_posts ADD COLUMN theme TEXT NOT NULL DEFAULT 'dark' CHECK(theme IN ('dark','lime','violet'));
