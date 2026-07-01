import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_shared";
import { pharmacies } from "./pharmacies";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  pharmacyId: text("pharmacy_id")
    .notNull()
    .references(() => pharmacies.id, { onDelete: "cascade" }),
  customerCep: text("customer_cep").notNull(),
  deliveryType: text("delivery_type", {
    enum: ["pickup", "moto", "distribution"],
  }).notNull(),
  status: text("status", {
    enum: ["released", "assembled", "ready_pickup", "completed"],
  }).notNull(),
  totalPriceCents: integer("total_price_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  distanceKm: real("distance_km"),
  estimatedTimeMin: integer("estimated_time_min").notNull(),
  stage1At: integer("stage1_at", { mode: "timestamp" }),
  stage2At: integer("stage2_at", { mode: "timestamp" }),
  stage3At: integer("stage3_at", { mode: "timestamp" }),
  ...timestamps,
});