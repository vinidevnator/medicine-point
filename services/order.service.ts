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
  cepCliente: string;
  tipoEntrega: "retirada" | "moto" | "distribuicao";
  quantidade: number;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; error: string };

const OUT_OF_STOCK = "OUT_OF_STOCK";

/** Ensures the DC virtual pharmacy has a stock row for `ean`, provisioning one on demand. */
function ensureDcStock(ean: string) {
  const existing = productRepo.getByPharmacyAndEan(DC_PHARMACY_ID, ean);
  if (existing) return existing;
  const reference = productRepo.getByEanGlobal(ean)[0];
  if (!reference) return undefined;
  productRepo.create({
    id: randomUUID(),
    pharmacyId: DC_PHARMACY_ID,
    ean: reference.ean,
    nome: reference.nome,
    descricao: reference.descricao,
    precoCents: reference.precoCents,
    quantidade: 999,
    imagePath: reference.imagePath,
  });
  return productRepo.getByPharmacyAndEan(DC_PHARMACY_ID, ean);
}

export const orderService = {
  placeOrder(input: PlaceOrderInput): PlaceOrderResult {
    const productRow =
      input.pharmacyId === DC_PHARMACY_ID
        ? ensureDcStock(input.productEan)
        : productRepo.getByPharmacyAndEan(input.pharmacyId, input.productEan);
    if (!productRow || productRow.quantidade < input.quantidade) {
      return { ok: false, error: "Estoque insuficiente para o pedido." };
    }
    const offerings = searchService.findByEanAndCep(input.productEan, input.cepCliente);
    const offering = offerings.find((o) => o.pharmacyId === input.pharmacyId);
    const distance = offering?.distanciaKm ?? 5;
    const est = searchService.estimateDelivery(input.tipoEntrega, distance);
    const freteCents = input.tipoEntrega === "moto" ? (offering?.freteCents ?? est.freteCents) : est.freteCents;

    const orderId = randomUUID();
    const precoUnit = productRow.precoCents;
    const precoTotal = precoUnit * input.quantidade + freteCents;
    const now = new Date();
    const etapa2 = new Date(now.getTime() + (est.tempoMin / 3) * 60 * 1000);
    const etapa3 = new Date(now.getTime() + (est.tempoMin * (2 / 3)) * 60 * 1000);

    try {
      db.transaction((tx) => {
        const decremented = tx
          .update(products)
          .set({
            quantidade: sql`${products.quantidade} - ${input.quantidade}`,
            updatedAt: now,
          })
          .where(and(eq(products.id, productRow.id), gte(products.quantidade, input.quantidade)))
          .run();
        if (decremented.changes === 0) throw new Error(OUT_OF_STOCK);

        tx.insert(orders)
          .values({
            id: orderId,
            pharmacyId: input.pharmacyId,
            cepCliente: input.cepCliente,
            tipoEntrega: input.tipoEntrega,
            status: "liberado",
            precoTotalCents: precoTotal,
            freteCents,
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
      });
    } catch (err) {
      if (err instanceof Error && err.message === OUT_OF_STOCK) {
        return { ok: false, error: "Estoque insuficiente para o pedido." };
      }
      throw err;
    }

    return { ok: true, orderId };
  },

  advance(orderId: string, pharmacyId: string): void {
    const detail = getOrder(orderId);
    if (!detail) return;
    const order = detail.order;
    if (order.pharmacyId !== pharmacyId) return;
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