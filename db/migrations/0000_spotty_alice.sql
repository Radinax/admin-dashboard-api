CREATE TABLE `order` (
	`id` text PRIMARY KEY NOT NULL,
	`date` integer NOT NULL,
	`user_id` text,
	`stock` text NOT NULL,
	`status` text DEFAULT 'in_process' NOT NULL,
	`type` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` decimal NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);