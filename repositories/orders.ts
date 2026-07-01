import "server-only";
import { db, schema } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { startOfDayUnix, startOfMonthUnix } from "@/lib/format";

export const orderRepo = {
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
  summaryForRange(pharmacyId: string, fromUnix: number, toUnix: number) {
    const rows = db
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
    return rows;
  },
  itemsForRange(pharmacyId: string, fromUnix: number, toUnix: number) {
    const rows = db
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
    return rows;
  },
  countByStatus(pharmacyId: string, status: "released" | "assembled" | "ready_pickup") {
    return db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(eq(orders.pharmacyId, pharmacyId), eq(orders.status, status)))
      .get()?.count ?? 0;
  },
  soldToday(pharmacyId: string) {
    const startOfDay = startOfDayUnix();
    const rows = db
      .select({ q: sql<number>`coalesce(sum(${orderItems.quantity}),0)` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.pharmacyId, pharmacyId), gte(orderItems.createdAt, new Date(startOfDay * 1000))))
      .get();
    return rows?.q ?? 0;
  },
  soldThisMonth(pharmacyId: string) {
    const start = startOfMonthUnix();
    const rows = db
      .select({ q: sql<number>`coalesce(sum(${orderItems.quantity}),0)` })
      .from(orderItems)
      .innerJoin(orders, eq(orders.id, orderItems.orderId))
      .where(and(eq(orders.pharmacyId, pharmacyId), gte(orderItems.createdAt, new Date(start * 1000))))
      .get();
    return rows?.q ?? 0;
  },
  revenueEstimate(pharmacyId: string) {
    const rows = db
      .select({ r: sql<number>`coalesce(sum(${orders.totalPriceCents}),0)` })
      .from(orders)
      .where(eq(orders.pharmacyId, pharmacyId))
      .get();
    return rows?.r ?? 0;
  },
};

export { db, schema };