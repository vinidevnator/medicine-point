import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/repositories";
import { orders, orderItems, products } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { productRepo } from "@/repositories";
import { searchService } from "./search.service";
import { DC_PHARMACY_ID } from "@/lib/constants";

export type PlaceOrderInput = {
  pharmacyId: string;
  productEan: string;
  customerCep: string;
  deliveryType: "pickup" | "moto" | "distribution";
  quantity: number;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

const OUT_OF_STOCK = "OUT_OF_STOCK";

/** Ensures the DC virtual pharmacy has a stock row for `ean`, provisioning one on demand. */
async function ensureDcStock(ean: string) {
  const existing = await productRepo.getByPharmacyAndEan(DC_PHARMACY_ID, ean);
  if (existing) return existing;
  const reference = (await productRepo.getByEanGlobal(ean))[0];
  if (!reference) return undefined;
  await productRepo.create({
    id: randomUUID(),
    pharmacyId: DC_PHARMACY_ID,
    ean: reference.ean,
    name: reference.name,
    description: reference.description,
    priceCents: reference.priceCents,
    quantity: 999,
    imagePath: reference.imagePath,
  });
  return productRepo.getByPharmacyAndEan(DC_PHARMACY_ID, ean);
}

export const orderService = {
  async placeOrder(input: PlaceOrderInput): Promise<PlaceOrderResult> {
    const productRow =
      input.pharmacyId === DC_PHARMACY_ID
        ? await ensureDcStock(input.productEan)
        : await productRepo.getByPharmacyAndEan(input.pharmacyId, input.productEan);
    if (!productRow || productRow.quantity < input.quantity) {
      return { ok: false, error: "Estoque insuficiente para o pedido." };
    }
    const offerings = await searchService.findByEanAndCep(input.productEan, input.customerCep);
    const offering = offerings.find((o) => o.pharmacyId === input.pharmacyId);
    const distance = offering?.distanceKm ?? 5;
    const est = searchService.estimateDelivery(input.deliveryType, distance);
    const shippingCents = input.deliveryType === "moto" ? (offering?.shippingCents ?? est.shippingCents) : est.shippingCents;

    const orderId = randomUUID();
    const unitPrice = productRow.priceCents;
    const totalPrice = unitPrice * input.quantity + shippingCents;
    const now = new Date();
    const stage2 = new Date(now.getTime() + (est.timeMin / 3) * 60 * 1000);
    const stage3 = new Date(now.getTime() + (est.timeMin * (2 / 3)) * 60 * 1000);

    try {
      await db.transaction(async (tx) => {
        const decremented = await tx
          .update(products)
          .set({
            quantity: sql`${products.quantity} - ${input.quantity}`,
            updatedAt: now,
          })
          .where(and(eq(products.id, productRow.id), gte(products.quantity, input.quantity)))
          .run();
        if (decremented.rowsAffected === 0) throw new Error(OUT_OF_STOCK);

        await tx.insert(orders)
          .values({
            id: orderId,
            pharmacyId: input.pharmacyId,
            customerCep: input.customerCep,
            deliveryType: input.deliveryType,
            status: "released",
            totalPriceCents: totalPrice,
            shippingCents: shippingCents,
            distanceKm: distance,
            estimatedTimeMin: est.timeMin,
            stage1At: now,
            stage2At: input.deliveryType === "pickup" ? stage2 : null,
            stage3At: input.deliveryType === "pickup" ? stage3 : null,
          })
          .run();
        await tx.insert(orderItems)
          .values({
            id: randomUUID(),
            orderId,
            productId: productRow.id,
            ean: productRow.ean,
            name: productRow.name,
            unitPriceCents: unitPrice,
            quantity: input.quantity,
          })
          .run();
      });
    } catch (err) {
      if (err instanceof Error && err.message === OUT_OF_STOCK) {
        return { ok: false, error: "Estoque insuficiente para o pedido." };
      }
      throw err;
    }

    return { ok: true, orderId };
  },

  async advance(orderId: string, pharmacyId: string): Promise<void> {
    const detail = await getOrder(orderId);
    if (!detail) return;
    const order = detail.order;
    if (order.pharmacyId !== pharmacyId) return;
    const next: Record<string, "assembled" | "ready_pickup" | "completed"> = {
      released: "assembled",
      assembled: "ready_pickup",
      ready_pickup: "completed",
      completed: "completed",
    };
    const ns = next[order.status] ?? "completed";
    const patch: Partial<typeof orders.$inferInsert> = { status: ns, updatedAt: new Date() };
    if (ns === "assembled" && !order.stage2At) patch.stage2At = new Date();
    if (ns === "ready_pickup") patch.stage3At = new Date();
    await db.update(orders).set(patch).where(eq(orders.id, orderId)).run();
  },
};

async function getOrder(orderId: string) {
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();
  return { order, items };
}