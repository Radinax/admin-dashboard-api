CREATE TABLE `product_warehouse` (
	`product_id` text NOT NULL,
	`warehouse_id` text NOT NULL,
	PRIMARY KEY(`product_id`, `warehouse_id`),
	FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_warehouse` (
	`user_id` text NOT NULL,
	`warehouse_id` text NOT NULL,
	`permission` text NOT NULL,
	PRIMARY KEY(`user_id`, `warehouse_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`warehouse_id`) REFERENCES `warehouse`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `warehouse` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`location` text
);
