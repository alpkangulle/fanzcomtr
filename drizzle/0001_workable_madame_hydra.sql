CREATE TABLE `channel_audit` (
	`id` text PRIMARY KEY NOT NULL,
	`artist` text NOT NULL,
	`moderator` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`reason` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_artist_created` ON `channel_audit` (`artist`,`created`);--> statement-breakpoint
CREATE TABLE `channel_mutes` (
	`artist` text NOT NULL,
	`guest_id` text NOT NULL,
	`name` text NOT NULL,
	`until` integer NOT NULL,
	`reason` text NOT NULL,
	PRIMARY KEY(`artist`, `guest_id`)
);
--> statement-breakpoint
CREATE TABLE `channel_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`artist` text NOT NULL,
	`message_id` text NOT NULL,
	`reporter` text NOT NULL,
	`reason` text NOT NULL,
	`created` integer NOT NULL,
	`resolved` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_reports_artist_resolved` ON `channel_reports` (`artist`,`resolved`);--> statement-breakpoint
ALTER TABLE `channel_guests` ADD `last_renamed` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `channel_guests` ADD `last_reported` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `channel_messages` ADD `deleted_at` integer;