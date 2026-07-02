"use server";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { requirePharmacy } from "@/services/auth-guard.service";
import { productRepo } from "@/repositories";
import { productSchema } from "@/lib/validations";
import { parseBRLToCents } from "@/lib/format";
import { onlyDigits } from "@/lib/masks";

export type ProductState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProductAction(_prev: ProductState, formData: FormData): Promise<ProductState> {
  const session = await requirePharmacy();
  const raw = {
    ean: String(formData.get("ean") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    imagePath: String(formData.get("imagePath") ?? ""),
    category: String(formData.get("category") ?? ""),
  };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Verifique os campos do produto.",
      fieldErrors: collect(parsed.error),
    };
  }
  const d = parsed.data;
  if (await productRepo.getByPharmacyAndEan(session.pharmacyId, d.ean)) {
    return { ok: false, error: "EAN já cadastrado.", fieldErrors: { ean: ["EAN já cadastrado"] } };
  }
  try {
    await productRepo.create({
      id: randomUUID(),
      pharmacyId: session.pharmacyId,
      ean: d.ean,
      name: d.name,
      description: d.description,
      priceCents: parseBRLToCents(d.price),
      quantity: Number(onlyDigits(d.quantity)),
      imagePath: d.imagePath || `/img/med-default.png`,
      category: d.category,
    });
  } catch (err) {
    if (isUniqueEanError(err)) {
      return { ok: false, error: "EAN já cadastrado.", fieldErrors: { ean: ["EAN já cadastrado"] } };
    }
    throw err;
  }
  revalidateProductPages();
  return { ok: true };
}

export async function updateProductAction(_prev: ProductState, formData: FormData): Promise<ProductState> {
  const session = await requirePharmacy();
  const id = String(formData.get("id") ?? "");
  const raw = {
    ean: String(formData.get("ean") ?? ""),
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: String(formData.get("price") ?? ""),
    quantity: String(formData.get("quantity") ?? ""),
    imagePath: String(formData.get("imagePath") ?? ""),
    category: String(formData.get("category") ?? ""),
  };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Verifique os campos.", fieldErrors: collect(parsed.error) };
  }
  const product = await productRepo.getById(id);
  if (!product || product.pharmacyId !== session.pharmacyId) {
    return { ok: false, error: "Produto não encontrado." };
  }
  const d = parsed.data;
  try {
    await productRepo.update(id, {
      ean: d.ean,
      name: d.name,
      description: d.description,
      priceCents: parseBRLToCents(d.price),
      quantity: Number(onlyDigits(d.quantity)),
      imagePath: d.imagePath || `/img/med-default.png`,
      category: d.category,
    });
  } catch (err) {
    if (isUniqueEanError(err)) {
      return { ok: false, error: "EAN já cadastrado.", fieldErrors: { ean: ["EAN já cadastrado"] } };
    }
    throw err;
  }
  revalidateProductPages();
  return { ok: true };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const session = await requirePharmacy();
  const id = String(formData.get("id") ?? "");
  const product = await productRepo.getById(id);
  if (!product || product.pharmacyId !== session.pharmacyId) return;
  await productRepo.delete(id);
  revalidateProductPages();
}

function revalidateProductPages(): void {
  revalidatePath("/dashboard/products");
  revalidatePath("/medicine/[ean]", "page");
  revalidatePath("/");
}

function isUniqueEanError(err: unknown): boolean {
  return (
    err instanceof Error &&
    /UNIQUE constraint failed: products\.(pharmacy_id|ean)/.test(err.message)
  );
}

function collect(error: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}