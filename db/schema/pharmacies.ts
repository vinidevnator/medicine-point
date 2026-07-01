import { sqliteTable, text, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_shared";

export const pharmacies = sqliteTable(
  "pharmacies",
  {
    id: text("id").primaryKey(),
    cnpj: text("cnpj").notNull(),
    legalName: text("legal_name").notNull(),
    tradeName: text("trade_name").notNull(),
    email: text("email").notNull(),
    cep: text("cep").notNull(),
    street: text("street").notNull(),
    number: text("number").notNull(),
    complement: text("complement"),
    district: text("district").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    revenue: text("revenue", {
      enum: ["up_to_50k", "50k_200k", "200k_500k", "above_500k"],
    }).notNull(),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("pharmacies_cnpj_unique").on(t.cnpj)]
);