-- Rename Portuguese DB columns to English (data-preserving).
ALTER TABLE `products` RENAME COLUMN `nome` TO `name`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `descricao` TO `description`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `preco_cents` TO `price_cents`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `quantidade` TO `quantity`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `cep_cliente` TO `customer_cep`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `tipo_entrega` TO `delivery_type`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `preco_total_cents` TO `total_price_cents`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `frete_cents` TO `shipping_cents`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `distancia_km` TO `distance_km`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `tempo_estimado_min` TO `estimated_time_min`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `etapa1_at` TO `stage1_at`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `etapa2_at` TO `stage2_at`;--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `etapa3_at` TO `stage3_at`;--> statement-breakpoint
ALTER TABLE `order_items` RENAME COLUMN `nome` TO `name`;--> statement-breakpoint
ALTER TABLE `order_items` RENAME COLUMN `preco_unit_cents` TO `unit_price_cents`;--> statement-breakpoint
ALTER TABLE `order_items` RENAME COLUMN `quantidade` TO `quantity`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `razao_social` TO `legal_name`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `nome_fantasia` TO `trade_name`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `logradouro` TO `street`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `numero` TO `number`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `complemento` TO `complement`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `bairro` TO `district`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `cidade` TO `city`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `estado` TO `state`;--> statement-breakpoint
ALTER TABLE `pharmacies` RENAME COLUMN `faturamento` TO `revenue`;--> statement-breakpoint
ALTER TABLE `pharmacy_settings` RENAME COLUMN `cep_base` TO `base_cep`;--> statement-breakpoint
ALTER TABLE `pharmacy_settings` RENAME COLUMN `raio_km` TO `radius_km`;--> statement-breakpoint
ALTER TABLE `pharmacy_settings` RENAME COLUMN `aceita_retirada` TO `accepts_pickup`;--> statement-breakpoint
ALTER TABLE `pharmacy_settings` RENAME COLUMN `aceita_moto` TO `accepts_moto`;--> statement-breakpoint
ALTER TABLE `pharmacy_settings` RENAME COLUMN `frete_moto_cents` TO `moto_shipping_cents`;--> statement-breakpoint
-- Backfill enum values to their English equivalents.
UPDATE `orders` SET `delivery_type` = 'pickup' WHERE `delivery_type` = 'retirada';--> statement-breakpoint
UPDATE `orders` SET `delivery_type` = 'distribution' WHERE `delivery_type` = 'distribuicao';--> statement-breakpoint
UPDATE `orders` SET `status` = 'released' WHERE `status` = 'liberado';--> statement-breakpoint
UPDATE `orders` SET `status` = 'assembled' WHERE `status` = 'montado';--> statement-breakpoint
UPDATE `orders` SET `status` = 'ready_pickup' WHERE `status` = 'pronto_coleta';--> statement-breakpoint
UPDATE `orders` SET `status` = 'completed' WHERE `status` = 'finalizado';--> statement-breakpoint
UPDATE `pharmacies` SET `revenue` = 'up_to_50k' WHERE `revenue` = 'ate_50k';--> statement-breakpoint
UPDATE `pharmacies` SET `revenue` = 'above_500k' WHERE `revenue` = 'acima_500k';
