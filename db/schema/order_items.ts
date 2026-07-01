import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_shared";
import { orders } from "./orders";
import { products } from "./products";

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  ean: text("ean").notNull(),
  nome: text("nome").notNull(),
  precoUnitCents: integer("preco_unit_cents").notNull(),
  quantidade: integer("quantidade").notNull(),
  ...timestamps,
});