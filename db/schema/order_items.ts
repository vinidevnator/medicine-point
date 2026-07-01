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
  name: text("name").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  ...timestamps,
});