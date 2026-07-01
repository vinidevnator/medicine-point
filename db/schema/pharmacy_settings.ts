import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_shared";
import { pharmacies } from "./pharmacies";

export const pharmacySettings = sqliteTable(
  "pharmacy_settings",
  {
    id: text("id").primaryKey(),
    pharmacyId: text("pharmacy_id")
      .notNull()
      .references(() => pharmacies.id, { onDelete: "cascade" }),
    baseCep: text("base_cep").notNull(),
    radiusKm: integer("radius_km").notNull().default(10),
    acceptsPickup: integer("accepts_pickup", { mode: "boolean" })
      .notNull()
      .default(true),
    acceptsMoto: integer("accepts_moto", { mode: "boolean" })
      .notNull()
      .default(true),
    motoShippingCents: integer("moto_shipping_cents").notNull().default(599),
    ...timestamps,
  },
  (t) => [uniqueIndex("pharmacy_settings_pharmacy_unique").on(t.pharmacyId)]
);