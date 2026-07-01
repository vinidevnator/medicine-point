import "server-only";
import { db, schema } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export const orderRepo = {
  create(input: {
    id: string;
    pharmacyId: string;
    cepCliente: string;
    tipoEntrega: "retirada" | "moto" | "distribuicao";
    status: "liberado" | "montado" | "pronto_coleta" | "finalizado";
    precoTotalCents: number;
    freteCents: number;
    distanciaKm: number | null;
    tempoEstimadoMin: number;
    etapa1At: Date;
    etapa2At: Date | null;
    etapa3At: Date | null;
    items: Array<{
      productId: string;
      ean: string;
      nome: string;
      precoUnitCents: number;
      quantidade: number;
    }>;
  }) {
    db.transaction((tx) => {
      tx.insert(orders)
        .values({
          id: input.id,
          pharmacyId: input.pharmacyId,
          cepCliente: input.cepCliente,
          tipoEntrega: input.tipoEntrega,
          status: input.status,
          precoTotalCents: input.precoTotalCents,
          freteCents: input.freteCents,
          distanciaKm: input.distanciaKm,
          tempoEstimadoMin: input.tempoEstimadoMin,
          etapa1At: input.etapa1At,
          etapa2At: input.etapa2At,
          etapa3At: input.etapa3At,
        })
        .run();
      for (const it of input.items) {
        tx.insert(orderItems)
          .values({
            id: crypto.randomUUID(),
            orderId: input.id,
            productId: it.productId,
            ean: it.ean,
            nome: it.nome,
            precoUnitCents: it.precoUnitCents,
            quantidade: it.quantidade,
          })
          .run();
      }
    });
  },
  get(id: string) {
    const order = db.select().from(orders).where(eq(orders.id, id)).get();
    if (!order) return null;
    const items = db.select().from(orderItems).where(eq(orderItems.orderId, id)).all();
    return { order, items };
  },
  listByPharmacy(pharmacyId: string) {
    return db
      .select()
      .from(orders)
      .where(eq(orders.pharmacyId, pharmacyId))
      .orderBy(desc(orders.createdAt))
      .all();
  },
  setStatus(id: string, status: "liberado" | "montado" | "pronto_coleta" | "finalizado", etapa3: boolean) {
    const patch: Partial<typeof orders.$inferInsert> = { status, updatedAt: new Date() };
    if (status === "montado") patch.etapa2At = new Date();
    if (etapa3) patch.etapa3At = new Date();
    db.update(orders).set(patch).where(eq(orders.id, id)).run();
  },
  summaryForRange(pharmacyId: string, fromUnix: number, toUnix: number) {
    const rows = db
      .select({
        tipoEntrega: orders.tipoEntrega,
        status: orders.status,
        total: orders.precoTotalCents,
        frete: orders.freteCents,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(
        and(
          eq(orders.pharmacyId, pharmacyId),
          gte(orders.createdAt, new Date(fromUnix * 1000)),
          lte(orders.createdAt, new Date(toUnix * 1000))
        )
      )
      .all();
    return rows;
  },
  itemsForRange(pharmacyId: string, fromUnix: number, toUnix: number) {
    const rows = db
      .select({
        nome: orderItems.nome,
        ean: orderItems.ean,
        quantidade: orderItems.quantidade,
        unit: orderItems.precoUnitCents,
        createdAt: orderItems.createdAt,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(
        and(
          eq(orders.pharmacyId, pharmacyId),
          gte(orderItems.createdAt, new Date(fromUnix * 1000)),
          lte(orderItems.createdAt, new Date(toUnix * 1000))
        )
      )
      .all();
    return rows;
  },
  countByStatus(pharmacyId: string, status: "liberado" | "montado" | "pronto_coleta") {
    return db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.pharmacyId, pharmacyId), eq(orders.status, status)))
      .get()?.count ?? 0;
  },
  soldToday(pharmacyId: string) {
    const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    const rows = db
      .select({ q: sql<number>`coalesce(sum(${orderItems.quantidade}),0)` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.pharmacyId, pharmacyId), gte(orderItems.createdAt, new Date(startOfDay * 1000))))
      .get();
    return rows?.q ?? 0;
  },
  soldThisMonth(pharmacyId: string) {
    const d = new Date();
    const start = Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000);
    const rows = db
      .select({ q: sql<number>`coalesce(sum(${orderItems.quantidade}),0)` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.pharmacyId, pharmacyId), gte(orderItems.createdAt, new Date(start * 1000))))
      .get();
    return rows?.q ?? 0;
  },
  revenueEstimate(pharmacyId: string) {
    const rows = db
      .select({ r: sql<number>`coalesce(sum(${orders.precoTotalCents}),0)` })
      .from(orders)
      .where(eq(orders.pharmacyId, pharmacyId))
      .get();
    return rows?.r ?? 0;
  },
};

export { db, schema };