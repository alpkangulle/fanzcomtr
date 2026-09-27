CREATE TABLE seo_config (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1);
INSERT INTO seo_config(id,value) VALUES(1,'{"indexNowEnabled":true,"googleEnabled":true,"googleIndexingEnabled":true,"dailyLimit":100,"property":"sc-domain:fanz.com.tr","indexNowKey":"","imageEnabled":false,"imageQuality":82,"phone":"","whatsapp":"","phoneEnabled":false,"whatsappEnabled":false,"boxes":[]}');
CREATE TABLE seo_overrides (path TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL,intro TEXT NOT NULL DEFAULT '',links TEXT NOT NULL DEFAULT '[]',updated INTEGER NOT NULL);
CREATE TABLE seo_queue (provider TEXT NOT NULL,url TEXT NOT NULL,fingerprint TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,next_attempt INTEGER NOT NULL DEFAULT 0,http_status INTEGER,message TEXT NOT NULL DEFAULT '',updated INTEGER NOT NULL,PRIMARY KEY(provider,url));
CREATE INDEX seo_queue_pending ON seo_queue(provider,status,next_attempt);
CREATE TABLE seo_daily (provider TEXT NOT NULL,day TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(provider,day));
CREATE TABLE seo_worker (id INTEGER PRIMARY KEY CHECK(id=1),lease_until INTEGER NOT NULL DEFAULT 0,last_run INTEGER,last_message TEXT NOT NULL DEFAULT '');
INSERT INTO seo_worker(id) VALUES(1);

UPDATE seo_config SET value=json_set(value,'$.indexNowKey',lower(hex(randomblob(24))));
CREATE TABLE seo_image_state(id INTEGER PRIMARY KEY CHECK(id=1),lease_until INTEGER NOT NULL DEFAULT 0,last_run INTEGER,last_message TEXT NOT NULL DEFAULT '');
INSERT INTO seo_image_state(id) VALUES(1);
