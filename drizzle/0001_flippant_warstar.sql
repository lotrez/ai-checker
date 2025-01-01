CREATE TABLE `cache` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text,
	`updated_at` integer
);
--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);