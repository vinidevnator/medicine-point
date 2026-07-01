CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text NOT NULL,
	`ean` text NOT NULL,
	`nome` text NOT NULL,
	`preco_unit_cents` integer NOT NULL,
	`quantidade` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`pharmacy_id` text NOT NULL,
	`cep_cliente` text NOT NULL,
	`tipo_entrega` text NOT NULL,
	`status` text NOT NULL,
	`preco_total_cents` integer NOT NULL,
	`frete_cents` integer DEFAULT 0 NOT NULL,
	`distancia_km` real,
	`tempo_estimado_min` integer NOT NULL,
	`etapa1_at` integer,
	`etapa2_at` integer,
	`etapa3_at` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pharmacies` (
	`id` text PRIMARY KEY NOT NULL,
	`cnpj` text NOT NULL,
	`razao_social` text NOT NULL,
	`nome_fantasia` text NOT NULL,
	`email` text NOT NULL,
	`cep` text NOT NULL,
	`logradouro` text NOT NULL,
	`numero` text NOT NULL,
	`complemento` text,
	`bairro` text NOT NULL,
	`cidade` text NOT NULL,
	`estado` text NOT NULL,
	`faturamento` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pharmacies_cnpj_unique` ON `pharmacies` (`cnpj`);--> statement-breakpoint
CREATE TABLE `pharmacy_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`pharmacy_id` text NOT NULL,
	`cep_base` text NOT NULL,
	`raio_km` integer DEFAULT 10 NOT NULL,
	`aceita_retirada` integer DEFAULT true NOT NULL,
	`aceita_moto` integer DEFAULT true NOT NULL,
	`frete_moto_cents` integer DEFAULT 599 NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pharmacy_settings_pharmacy_unique` ON `pharmacy_settings` (`pharmacy_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`pharmacy_id` text NOT NULL,
	`ean` text NOT NULL,
	`nome` text NOT NULL,
	`descricao` text NOT NULL,
	`preco_cents` integer NOT NULL,
	`quantidade` integer DEFAULT 0 NOT NULL,
	`image_path` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_pharmacy_ean_unique` ON `products` (`pharmacy_id`,`ean`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`pharmacy_id` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`pharmacy_id`) REFERENCES `pharmacies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);