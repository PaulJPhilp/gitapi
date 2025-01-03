DROP TABLE `prompt_runs`;--> statement-breakpoint
DROP TABLE `prompts`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_models` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider_id` text NOT NULL,
	`model_family` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`context_window` integer NOT NULL,
	`max_tokens` integer,
	`input_price_per_token` text NOT NULL,
	`output_price_per_token` text NOT NULL,
	`supported_features` text NOT NULL,
	`release_date` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_models`("id", "name", "provider_id", "model_family", "is_enabled", "context_window", "max_tokens", "input_price_per_token", "output_price_per_token", "supported_features", "release_date", "created_at", "updated_at") SELECT "id", "name", "provider_id", "model_family", "is_enabled", "context_window", "max_tokens", "input_price_per_token", "output_price_per_token", "supported_features", "release_date", "created_at", "updated_at" FROM `models`;--> statement-breakpoint
DROP TABLE `models`;--> statement-breakpoint
ALTER TABLE `__new_models` RENAME TO `models`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`website` text NOT NULL,
	`api_key_required` integer DEFAULT true NOT NULL,
	`base_url` text,
	`is_enabled` integer DEFAULT true NOT NULL,
	`release_date` text,
	`supported_features` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_providers`("id", "name", "description", "website", "api_key_required", "base_url", "is_enabled", "release_date", "supported_features", "created_at", "updated_at") SELECT "id", "name", "description", "website", "api_key_required", "base_url", "is_enabled", "release_date", "supported_features", "created_at", "updated_at" FROM `providers`;--> statement-breakpoint
DROP TABLE `providers`;--> statement-breakpoint
ALTER TABLE `__new_providers` RENAME TO `providers`;