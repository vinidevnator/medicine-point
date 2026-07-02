import "server-only";
import { db, schema } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { startOfDayUnix, startOfMonthUnix } from "@/lib/format";

export const orderRepo = {
  async get(id: string) {
    const order = await db.select().from(orders).where(eq(orders.id, id)).get();
    if (!order) return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id)).all();
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
  summaryForRange(pharmacyId: string, fromUnix: number, toUnix: number) {
    return db
      .select({
        deliveryType: orders.deliveryType,
        status: orders.status,
        total: orders.totalPriceCents,
        shipping: orders.shippingCents,
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
  },
  itemsForRange(pharmacyId: string, fromUnix: number, toUnix: number) {
    return db
      .select({
        name: orderItems.name,
        ean: orderItems.ean,
        quantity: orderItems.quantity,
        unit: orderItems.unitPriceCents,
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
  },
  async countByStatus(pharmacyId: string, status: "released" | "assembled" | "ready_pickup") {
    const row = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.pharmacyId, pharmacyId), eq(orders.status, status)))
      .get();
    return row?.count ?? 0;
  },
  async soldToday(pharmacyId: string) {
    const startOfDay = startOfDayUnix();
    const row = await db
      .select({ q: sql<number>`coalesce(sum(${orderItems.quantity}),0)` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.pharmacyId, pharmacyId), gte(orderItems.createdAt, new Date(startOfDay * 1000))))
      .get();
    return row?.q ?? 0;
  },
  async soldThisMonth(pharmacyId: string) {
    const start = startOfMonthUnix();
    const row = await db
      .select({ q: sql<number>`coalesce(sum(${orderItems.quantity}),0)` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.pharmacyId, pharmacyId), gte(orderItems.createdAt, new Date(start * 1000))))
      .get();
    return row?.q ?? 0;
  },
  async revenueEstimate(pharmacyId: string) {
    const row = await db
      .select({ r: sql<number>`coalesce(sum(${orders.totalPriceCents}),0)` })
      .from(orders)
      .where(eq(orders.pharmacyId, pharmacyId))
      .get();
    return row?.r ?? 0;
  },
};

export { db, schema };
