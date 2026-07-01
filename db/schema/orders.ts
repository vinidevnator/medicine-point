import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_shared";
import { pharmacies } from "./pharmacies";

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  pharmacyId: text("pharmacy_id")
    .notNull()
    .references(() => pharmacies.id, { onDelete: "cascade" }),
  cepCliente: text("cep_cliente").notNull(),
  tipoEntrega: text("tipo_entrega", {
    enum: ["retirada", "moto", "distribuicao"],
  }).notNull(),
  status: text("status", {
    enum: ["liberado", "montado", "pronto_coleta", "finalizado"],
  }).notNull(),
  precoTotalCents: integer("preco_total_cents").notNull(),
  freteCents: integer("frete_cents").notNull().default(0),
  distanciaKm: real("distancia_km"),
  tempoEstimadoMin: integer("tempo_estimado_min").notNull(),
  etapa1At: integer("etapa1_at", { mode: "timestamp" }),
  etapa2At: integer("etapa2_at", { mode: "timestamp" }),
  etapa3At: integer("etapa3_at", { mode: "timestamp" }),
  ...timestamps,
});