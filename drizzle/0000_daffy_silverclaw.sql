CREATE TABLE `channel_guests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`expires` integer NOT NULL,
	`last_sent` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `channel_messages` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`artist` text NOT NULL,
	`guest_id` text NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `channel_messages_id_unique` ON `channel_messages` (`id`);--> statement-breakpoint
CREATE INDEX `idx_messages_artist_seq` ON `channel_messages` (`artist`,`seq`);--> statement-breakpoint
CREATE TABLE `channel_presence` (
	`artist` text NOT NULL,
	`guest_id` text NOT NULL,
	`name` text NOT NULL,
	`seen` integer NOT NULL,
	PRIMARY KEY(`artist`, `guest_id`)
);
--> statement-breakpoint
CREATE INDEX `idx_presence_artist_seen` ON `channel_presence` (`artist`,`seen`);