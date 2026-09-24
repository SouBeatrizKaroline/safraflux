CREATE TABLE `snapshots` (
	`owner` text NOT NULL,
	`revision` integer NOT NULL,
	`at` text NOT NULL,
	`data` text NOT NULL,
	PRIMARY KEY(`owner`, `revision`)
);
