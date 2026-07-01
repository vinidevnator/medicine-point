import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_shared";
import { pharmacies } from "./pharmacies";
import { CATEGORIES } from "@/lib/constants";

// EAN uniquely identifies a medicine. Each pharmacy maintains its own inventory
// row for a given EAN, enabling the marketplace search to list availability
// across multiple pharmacies for the same medicine.
export const products = sqliteTable(
  "products",
  {
    id: text("id").primaryKey(),
    pharmacyId: text("pharmacy_id")
      .notNull()
      .references(() => pharmacies.id, { onDelete: "cascade" }),
    ean: text("ean").notNull(),
    nome: text("nome").notNull(),
    descricao: text("descricao").notNull(),
    precoCents: integer("preco_cents").notNull(),
    quantidade: integer("quantidade").notNull().default(0),
    imagePath: text("image_path").notNull().default(""),
    category: text("category", { enum: CATEGORIES.map((c) => c.slug) as [string, ...string[]] }).notNull().default("respiratorio"),
    ...timestamps,
  },
  (t) => [uniqueIndex("products_pharmacy_ean_unique").on(t.pharmacyId, t.ean)]
);