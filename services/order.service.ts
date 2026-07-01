import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/repositories";
import { orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { productRepo } from "@/repositories";
import { searchService } from "./search.service";

export type PlaceOrderInput = {
  pharmacyId: string;
  productEan: string;
  cepCliente: string;
  tipoEntrega: "retirada" | "moto" | "distribuicao";
  quantidade: number;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

export const orderService = {
  placeOrder(input: PlaceOrderInput): PlaceOrderResult {
    const productRow = productRepo.getByPharmacyAndEan(input.pharmacyId, input.productEan);
    if (!productRow || productRow.quantidade < input.quantidade) {
      return { ok: false, error: "Estoque insuficiente para o pedido." };
    }
    const offerings = searchService.findByEanAndCep(input.productEan, input.cepCliente);
    const offering = offerings.find((o) => o.pharmacyId === input.pharmacyId);
    const distance = offering?.distanciaKm ?? 5;
    const est = searchService.estimateDelivery(input.tipoEntrega, distance);

    const orderId = randomUUID();
    const precoUnit = productRow.precoCents;
    const precoTotal = precoUnit * input.quantidade + est.freteCents;
    const now = new Date();
    const etapa2 = new Date(now.getTime() + (est.tempoMin / 3) * 60 * 1000);
    const etapa3 = new Date(now.getTime() + (est.tempoMin * (2 / 3)) * 60 * 1000);

    db.transaction((tx) => {
      tx.insert(orders)
        .values({
          id: orderId,
          pharmacyId: input.pharmacyId,
          cepCliente: input.cepCliente,
          tipoEntrega: input.tipoEntrega,
          status: "liberado",
          precoTotalCents: precoTotal,
          freteCents: est.freteCents,
          distanciaKm: distance,
          tempoEstimadoMin: est.tempoMin,
          etapa1At: now,
          etapa2At: input.tipoEntrega === "retirada" ? etapa2 : null,
          etapa3At: input.tipoEntrega === "retirada" ? etapa3 : null,
        })
        .run();
      tx.insert(orderItems)
        .values({
          id: randomUUID(),
          orderId,
          productId: productRow.id,
          ean: productRow.ean,
          nome: productRow.nome,
          precoUnitCents: precoUnit,
          quantidade: input.quantidade,
        })
        .run();
      tx.update(products)
        .set({
          quantidade: productRow.quantidade - input.quantidade,
          updatedAt: now,
        })
        .where(eq(products.id, productRow.id))
        .run();
    });

    return { ok: true, orderId };
  },

  advance(orderId: string): void {
    const detail = getOrder(orderId);
    if (!detail) return;
    const order = detail.order;
    const next: Record<string, "montado" | "pronto_coleta" | "finalizado"> = {
      liberado: "montado",
      montado: "pronto_coleta",
      pronto_coleta: "finalizado",
      finalizado: "finalizado",
    };
    const ns = next[order.status] ?? "finalizado";
    const patch: Partial<typeof orders.$inferInsert> = { status: ns, updatedAt: new Date() };
    if (ns === "montado" && !order.etapa2At) patch.etapa2At = new Date();
    if (ns === "pronto_coleta") patch.etapa3At = new Date();
    db.update(orders).set(patch).where(eq(orders.id, orderId)).run();
  },
};

function getOrder(orderId: string) {
  const order = db.select().from(orders).where(eq(orders.id,orderId)).get();
  if (!order) return null;
  const items = db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();
  return { order, items };
}