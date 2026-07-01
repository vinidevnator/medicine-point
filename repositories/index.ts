import "server-only";
import { db, schema } from "@/db";
import { users, pharmacies, pharmacySettings, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const authRepo = {
  findByEmail(email: string) {
    return db.select().from(users).where(eq(users.email, email)).get();
  },
  findUserWithPharmacy(userId: string) {
    const row = db
      .select({
        user: users,
        pharmacy: pharmacies,
      })
      .from(users)
      .leftJoin(pharmacies, eq(pharmacies.id, users.pharmacyId))
      .where(eq(users.id, userId))
      .get();
    return row;
  },
  createUser(input: {
    id: string;
    email: string;
    passwordHash: string;
    role: "pharmacy_admin";
    pharmacyId: string;
  }) {
    db.insert(users)
      .values({
        id: input.id,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        pharmacyId: input.pharmacyId,
      })
      .run();
    return input.id;
  },
} satisfies Record<string, (...args: never[]) => unknown>;

export const pharmacyRepo = {
  create(input: Omit<typeof pharmacies.$inferInsert, "createdAt" | "updatedAt">) {
    db.insert(pharmacies).values(input).run();
  },
  createSettings(input: Omit<typeof pharmacySettings.$inferInsert, "createdAt" | "updatedAt">) {
    db.insert(pharmacySettings).values(input).run();
  },
  getSettings(pharmacyId: string) {
    return db
      .select()
      .from(pharmacySettings)
      .where(eq(pharmacySettings.pharmacyId, pharmacyId))
      .get();
  },
  updateSettings(
    pharmacyId: string,
    input: Partial<Omit<typeof pharmacySettings.$inferInsert, "createdAt" | "updatedAt" | "id" | "pharmacyId">>
  ) {
    db.update(pharmacySettings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(pharmacySettings.pharmacyId, pharmacyId))
      .run();
  },
  get(pharmacyId: string) {
    return db.select().from(pharmacies).where(eq(pharmacies.id, pharmacyId)).get();
  },
  update(pharmacyId: string, input: Partial<typeof pharmacies.$inferInsert>) {
    db.update(pharmacies)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(pharmacies.id, pharmacyId))
      .run();
  },
  allWithSettings() {
    return db
      .select({
        pharmacy: pharmacies,
        settings: pharmacySettings,
      })
      .from(pharmacies)
      .innerJoin(pharmacySettings, eq(pharmacySettings.pharmacyId, pharmacies.id))
      .all();
  },
};

export const productRepo = {
  listByPharmacy(pharmacyId: string) {
    return db.select().from(products).where(eq(products.pharmacyId, pharmacyId)).all();
  },
  getByEanGlobal(ean: string) {
    return db.select().from(products).where(eq(products.ean, ean)).all();
  },
  getByPharmacyAndEan(pharmacyId: string, ean: string) {
    return db
      .select()
      .from(products)
      .where(eq(products.pharmacyId, pharmacyId))
      .all()
      .find((p) => p.ean === ean);
  },
  getById(id: string) {
    return db.select().from(products).where(eq(products.id, id)).get();
  },
  create(input: Omit<typeof products.$inferInsert, "createdAt" | "updatedAt">) {
    db.insert(products).values(input).run();
  },
  update(id: string, input: Partial<typeof products.$inferInsert>) {
    db.update(products)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(products.id, id))
      .run();
  },
  delete(id: string) {
    db.delete(products).where(eq(products.id, id)).run();
  },
  listDistinctEans() {
    const rows = db
      .select({ ean: products.ean, name: products.name, description: products.description, category: products.category })
      .from(products)
      .all();
    const map = new Map<string, { ean: string; name: string; description: string; category: string }>();
    for (const r of rows) {
      if (!map.has(r.ean)) map.set(r.ean, { ean: r.ean, name: r.name, description: r.description, category: r.category });
    }
    return [...map.values()];
  },
};

export { db, schema };
export { orderRepo } from "./orders";