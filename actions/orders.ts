"use server";
import { revalidatePath } from "next/cache";
import { requirePharmacy } from "@/services/auth-guard.service";
import { orderService } from "@/services/order.service";

export type BuyState = {
  ok: boolean;
  orderId?: string;
  error?: string;
};

export async function buyNowAction(
  _prev: BuyState,
  formData: FormData
): Promise<BuyState> {
  const pharmacyId = String(formData.get("pharmacyId") ?? "");
  const productEan = String(formData.get("ean") ?? "");
  const cepCliente = String(formData.get("cep") ?? "").replace(/\D/g, "");
  const tipoEntrega = String(formData.get("tipoEntrega") ?? "retirada") as
    | "retirada"
    | "moto"
    | "distribuicao";
  const quantidade = Number(formData.get("quantidade") ?? 1);

  if (!pharmacyId) return { ok: false, error: "Selecione uma farmácia." };
  if (!productEan || cepCliente.length !== 8) {
    return { ok: false, error: "Informe CEP e produto válidos." };
  }
  const res = orderService.placeOrder({
    pharmacyId,
    productEan,
    cepCliente,
    tipoEntrega,
    quantidade: Math.max(1, Math.floor(quantidade)),
  });
  if (!res.ok) return { ok: false, error: res.error };
  revalidatePath("/medicamento/[ean]");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/pedidos");
  return { ok: true, orderId: res.orderId };
}

export async function advanceOrderAction(formData: FormData): Promise<void> {
  await requirePharmacy();
  const orderId = String(formData.get("id") ?? "");
  if (!orderId) return;
  orderService.advance(orderId);
  revalidatePath("/dashboard/pedidos");
  revalidatePath(`/pedido/${orderId}`);
}