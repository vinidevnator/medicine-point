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
  const customerCep = String(formData.get("cep") ?? "").replace(/\D/g, "");
  const deliveryType = String(formData.get("deliveryType") ?? "pickup") as
    | "pickup"
    | "moto"
    | "distribution";
  const quantity = Number(formData.get("quantity") ?? 1);

  if (!pharmacyId) return { ok: false, error: "Selecione uma farmácia." };
  if (!productEan || customerCep.length !== 8) {
    return { ok: false, error: "Informe CEP e produto válidos." };
  }
  const res = orderService.placeOrder({
    pharmacyId,
    productEan,
    customerCep,
    deliveryType,
    quantity: Math.max(1, Math.floor(quantity)),
  });
  if (!res.ok) return { ok: false, error: res.error };
  revalidatePath("/medicine/[ean]", "page");
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/orders");
  return { ok: true, orderId: res.orderId };
}

export async function advanceOrderAction(formData: FormData): Promise<void> {
  const session = await requirePharmacy();
  const orderId = String(formData.get("id") ?? "");
  if (!orderId) return;
  orderService.advance(orderId, session.pharmacyId);
  revalidatePath("/dashboard/orders");
  revalidatePath(`/order/${orderId}`);
}