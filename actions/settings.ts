"use server";
import { revalidatePath } from "next/cache";
import { requirePharmacy } from "@/services/auth-guard.service";
import { pharmacyRepo } from "@/repositories";
import { settingsSchema, accountSchema } from "@/lib/validations";
import { parseBRLToCents } from "@/lib/format";

export type SettingsState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function updateSettingsAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await requirePharmacy();
  const settings = await pharmacyRepo.getSettings(session.pharmacyId);
  if (!settings) return { ok: false, error: "Configuração não encontrada." };
  const raw = {
    baseCep: String(formData.get("baseCep") ?? ""),
    radiusKm: Number(formData.get("radiusKm") ?? 10),
    acceptsPickup: formData.get("acceptsPickup") === "on",
    acceptsMoto: formData.get("acceptsMoto") === "on",
    motoShipping: String(formData.get("motoShipping") ?? ""),
  };
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Verifique as configurações.", fieldErrors: collect(parsed.error) };
  }
  const d = parsed.data;
  await pharmacyRepo.updateSettings(session.pharmacyId, {
    baseCep: d.baseCep,
    radiusKm: d.radiusKm,
    acceptsPickup: d.acceptsPickup,
    acceptsMoto: d.acceptsMoto,
    motoShippingCents: parseBRLToCents(d.motoShipping),
  });
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateAccountAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await requirePharmacy();
  const raw = {
    legalName: String(formData.get("legalName") ?? ""),
    tradeName: String(formData.get("tradeName") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  const parsed = accountSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Verifique os dados.", fieldErrors: collect(parsed.error) };
  }
  await pharmacyRepo.update(session.pharmacyId, {
    legalName: parsed.data.legalName,
    tradeName: parsed.data.tradeName,
    email: parsed.data.email,
  });
  revalidatePath("/dashboard/account");
  return { ok: true };
}

function collect(error: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}