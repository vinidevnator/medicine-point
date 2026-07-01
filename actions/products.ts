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
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    preco: String(formData.get("preco") ?? ""),
    quantidade: String(formData.get("quantidade") ?? ""),
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
  if (productRepo.getByPharmacyAndEan(session.pharmacyId, d.ean)) {
    return { ok: false, error: "EAN já cadastrado.", fieldErrors: { ean: ["EAN já cadastrado"] } };
  }
  productRepo.create({
    id: randomUUID(),
    pharmacyId: session.pharmacyId,
    ean: d.ean,
    nome: d.nome,
    descricao: d.descricao,
    precoCents: parseBRLToCents(d.preco),
    quantidade: Number(onlyDigits(d.quantidade)),
    imagePath: d.imagePath || `/img/med-generico.svg`,
    category: d.category,
  });
  revalidatePath("/dashboard/produtos");
  return { ok: true };
}

export async function updateProductAction(_prev: ProductState, formData: FormData): Promise<ProductState> {
  const session = await requirePharmacy();
  const id = String(formData.get("id") ?? "");
  const raw = {
    ean: String(formData.get("ean") ?? ""),
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    preco: String(formData.get("preco") ?? ""),
    quantidade: String(formData.get("quantidade") ?? ""),
    imagePath: String(formData.get("imagePath") ?? ""),
    category: String(formData.get("category") ?? ""),
  };
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Verifique os campos.", fieldErrors: collect(parsed.error) };
  }
  const product = productRepo.getById(id);
  if (!product || product.pharmacyId !== session.pharmacyId) {
    return { ok: false, error: "Produto não encontrado." };
  }
  const d = parsed.data;
  productRepo.update(id, {
    ean: d.ean,
    nome: d.nome,
    descricao: d.descricao,
    precoCents: parseBRLToCents(d.preco),
    quantidade: Number(onlyDigits(d.quantidade)),
    imagePath: d.imagePath || product.imagePath,
    category: d.category,
  });
  revalidatePath("/dashboard/produtos");
  return { ok: true };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const session = await requirePharmacy();
  const id = String(formData.get("id") ?? "");
  const product = productRepo.getById(id);
  if (!product || product.pharmacyId !== session.pharmacyId) return;
  productRepo.delete(id);
  revalidatePath("/dashboard/produtos");
}

function collect(error: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}