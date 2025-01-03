CREATE TABLE `models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider_id` text NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`context_window` integer,
	`max_tokens` integer,
	`input_price_per_token` real NOT NULL,
	`output_price_per_token` real NOT NULL,
	`max_concurrent_requests` integer,
	`supported_features` blob NOT NULL,
	`model_family` text,
	`version` text,
	`training_cutoff` text,
	`release_date` text,
	`default_temperature` real,
	`min_temperature` real,
	`max_temperature` real,
	`default_top_p` real,
	`default_top_k` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prompt_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`prompt_id` text NOT NULL,
	`model_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`content` text NOT NULL,
	`completion` text NOT NULL,
	`usage` blob NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`prompt_id`) REFERENCES `prompts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `providers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prompts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`model_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`model_id`) REFERENCES `models`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`website` text NOT NULL,
	`api_key_required` integer NOT NULL,
	`base_url` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`release_date` text NOT NULL,
	`supported_features` blob NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
