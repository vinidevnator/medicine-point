import { sqliteTable, text, real, uniqueIndex } from "drizzle-orm/sqlite-core";
import { timestamps } from "./_shared";

export const pharmacies = sqliteTable(
  "pharmacies",
  {
    id: text("id").primaryKey(),
    cnpj: text("cnpj").notNull(),
    razaoSocial: text("razao_social").notNull(),
    nomeFantasia: text("nome_fantasia").notNull(),
    email: text("email").notNull(),
    cep: text("cep").notNull(),
    logradouro: text("logradouro").notNull(),
    numero: text("numero").notNull(),
    complemento: text("complemento"),
    bairro: text("bairro").notNull(),
    cidade: text("cidade").notNull(),
    estado: text("estado").notNull(),
    faturamento: text("faturamento", {
      enum: ["ate_50k", "50k_200k", "200k_500k", "acima_500k"],
    }).notNull(),
    lat: real("lat").notNull(),
    lng: real("lng").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("pharmacies_cnpj_unique").on(t.cnpj)]
);