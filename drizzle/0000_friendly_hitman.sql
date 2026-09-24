CREATE TABLE `events` (
	`owner` text NOT NULL,
	`revision` integer NOT NULL,
	`action` text NOT NULL,
	`at` text NOT NULL,
	`digest` text NOT NULL,
	PRIMARY KEY(`owner`, `revision`)
);
--> statement-breakpoint
CREATE TABLE `request_limits` (
	`owner` text PRIMARY KEY NOT NULL,
	`window` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`owner` text PRIMARY KEY NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`data` text NOT NULL
);
