import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { users, pharmacies, pharmacySettings, products } from "./schema";
import bcrypt from "bcryptjs";
import path from "node:path";

const DB_PATH = path.resolve(process.cwd(), "medicine-point.db");
const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "db/migrations");

const SEED_PRODUCTS = [
  {
    ean: "7890000000001",
    nome: "Medicamento Respiratório",
    descricao: "Medicamento utilizado para alívio dos sintomas respiratórios.",
    precoCents: 3990,
    quantidade: 100,
    imagePath: "/img/med-respiratorio.svg",
  },
  {
    ean: "7890000000002",
    nome: "Medicamento de Hipertensão",
    descricao: "Medicamento utilizado para controle da pressão arterial.",
    precoCents: 8990,
    quantidade: 80,
    imagePath: "/img/med-hipertensao.svg",
  },
  {
    ean: "7890000000003",
    nome: "Medicamento de Febre",
    descricao: "Medicamento para redução da febre e dores leves.",
    precoCents: 1990,
    quantidade: 250,
    imagePath: "/img/med-febre.svg",
  },
] as const;

function run() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = OFF");
  const db = drizzle({ client: sqlite, schema });

  console.log("[seed] applying migrations…");
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  sqlite.pragma("foreign_keys = ON");

  const existing = db.select().from(pharmacies).limit(1).all();
  if (existing.length > 0) {
    console.log("[seed] demo pharmacy already exists — skipping.");
    return;
  }

  const pharmacyId = randomUUID();
  const userId = randomUUID();

  db.transaction((tx) => {
    tx.insert(pharmacies)
      .values({
        id: pharmacyId,
        cnpj: "12.345.678/0001-90",
        razaoSocial: "Drogasil Demo Ltda",
        nomeFantasia: "Drogasil Demo",
        email: "demo@medicinepoint.com.br",
        cep: "01310-100",
        logradouro: "Avenida Paulista",
        numero: "1000",
        complemento: "Loja 1",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        estado: "SP",
        faturamento: "50k_200k",
        lat: -23.5616,
        lng: -46.6561,
      })
      .run();

    tx.insert(pharmacySettings)
      .values({
        id: randomUUID(),
        pharmacyId,
        cepBase: "01310-100",
        raioKm: 15,
        aceitaRetirada: true,
        aceitaMoto: true,
        freteMotoCents: 799,
      })
      .run();

    const passwordHash = bcrypt.hashSync("demo12345", 10);
    tx.insert(users)
      .values({
        id: userId,
        email: "demo@medicinepoint.com.br",
        passwordHash,
        role: "pharmacy_admin",
        pharmacyId,
      })
      .run();

    for (const p of SEED_PRODUCTS) {
      tx.insert(products)
        .values({
          id: randomUUID(),
          pharmacyId,
          ean: p.ean,
          nome: p.nome,
          descricao: p.descricao,
          precoCents: p.precoCents,
          quantidade: p.quantidade,
          imagePath: p.imagePath,
        })
        .run();
    }
  });

  console.log("[seed] demo pharmacy created.");
  console.log("      login: demo@medicinepoint.com.br");
  console.log("      senha: demo12345");
}

run();