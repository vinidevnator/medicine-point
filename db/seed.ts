import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { eq, ne } from "drizzle-orm";
import * as schema from "./schema";
import { users, pharmacies, pharmacySettings, products } from "./schema";
import bcrypt from "bcryptjs";
import path from "node:path";
import { DC_PHARMACY_ID } from "../lib/constants";

const DB_PATH = path.resolve(process.cwd(), "medicine-point.db");
const MIGRATIONS_FOLDER = path.resolve(process.cwd(), "db/migrations");

const SEED_PRODUCTS = [
  {
    ean: "7890000000001",
    nome: "Medicamento Respiratório",
    descricao: "Medicamento utilizado para alívio dos sintomas respiratórios.",
    precoCents: 3990,
    quantidade: 100,
    imagePath: "/img/med-default.png",
    category: "respiratorio" as const,
  },
  {
    ean: "7890000000002",
    nome: "Medicamento de Hipertensão",
    descricao: "Medicamento utilizado para controle da pressão arterial.",
    precoCents: 8990,
    quantidade: 80,
    imagePath: "/img/med-default.png",
    category: "cardio" as const,
  },
  {
    ean: "7890000000003",
    nome: "Medicamento de Febre",
    descricao: "Medicamento para redução da febre e dores leves.",
    precoCents: 1990,
    quantidade: 250,
    imagePath: "/img/med-default.png",
    category: "analgesico" as const,
  },
] as const;

function ensureDcPharmacy(db: ReturnType<typeof drizzle>): void {
  const dc = db.select().from(pharmacies).where(eq(pharmacies.id, DC_PHARMACY_ID)).get();
  if (dc) return;

  db.transaction((tx) => {
    tx.insert(pharmacies)
      .values({
        id: DC_PHARMACY_ID,
        cnpj: "00.000.000/0001-00",
        legalName: "Entrega de Parceiro Medicine Point",
        tradeName: "Entrega de Parceiro",
        email: "dc@medicinepoint.internal",
        cep: "00000-000",
        street: "Entrega de Parceiro",
        number: "0",
        complement: "",
        district: "-",
        city: "-",
        state: "SP",
        revenue: "above_500k",
        lat: -23.5616,
        lng: -46.6561,
      })
      .run();

    tx.insert(pharmacySettings)
      .values({
        id: randomUUID(),
        pharmacyId: DC_PHARMACY_ID,
        baseCep: "00000-000",
        radiusKm: 1,
        acceptsPickup: false,
        acceptsMoto: false,
        motoShippingCents: 0,
      })
      .run();
  });

  console.log("[seed] Entrega de Parceiro virtual pharmacy created.");
}

function run() {
  const sqlite = new Database(DB_PATH);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = OFF");
  const db = drizzle({ client: sqlite, schema });

  console.log("[seed] applying migrations…");
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  sqlite.pragma("foreign_keys = ON");

  ensureDcPharmacy(db);

  const existing = db.select().from(pharmacies).where(ne(pharmacies.id, DC_PHARMACY_ID)).limit(1).all();
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
        legalName: "Drogasil Demo Ltda",
        tradeName: "Drogasil Demo",
        email: "demo@medicinepoint.com.br",
        cep: "01310-100",
        street: "Avenida Paulista",
        number: "1000",
        complement: "Loja 1",
        district: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        revenue: "50k_200k",
        lat: -23.5616,
        lng: -46.6561,
      })
      .run();

    tx.insert(pharmacySettings)
      .values({
        id: randomUUID(),
        pharmacyId,
        baseCep: "01310-100",
        radiusKm: 15,
        acceptsPickup: true,
        acceptsMoto: true,
        motoShippingCents: 799,
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
          name: p.nome,
          description: p.descricao,
          priceCents: p.precoCents,
          quantity: p.quantidade,
          imagePath: p.imagePath,
          category: p.category,
        })
        .run();
    }
  });

  console.log("[seed] demo pharmacy created.");
  console.log("      login: demo@medicinepoint.com.br");
  console.log("      senha: demo12345");
}

run();