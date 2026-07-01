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
    cepBase: text("cep_base").notNull(),
    raioKm: integer("raio_km").notNull().default(10),
    aceitaRetirada: integer("aceita_retirada", { mode: "boolean" })
      .notNull()
      .default(true),
    aceitaMoto: integer("aceita_moto", { mode: "boolean" })
      .notNull()
      .default(true),
    freteMotoCents: integer("frete_moto_cents").notNull().default(599),
    ...timestamps,
  },
  (t) => [uniqueIndex("pharmacy_settings_pharmacy_unique").on(t.pharmacyId)]
);