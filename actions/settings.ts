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
  const settings = pharmacyRepo.getSettings(session.pharmacyId);
  if (!settings) return { ok: false, error: "Configuração não encontrada." };
  const raw = {
    cepBase: String(formData.get("cepBase") ?? ""),
    raioKm: Number(formData.get("raioKm") ?? 10),
    aceitaRetirada: formData.get("aceitaRetirada") === "on",
    aceitaMoto: formData.get("aceitaMoto") === "on",
    freteMoto: String(formData.get("freteMoto") ?? ""),
  };
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Verifique as configurações.", fieldErrors: collect(parsed.error) };
  }
  const d = parsed.data;
  pharmacyRepo.updateSettings(session.pharmacyId, {
    cepBase: d.cepBase,
    raioKm: d.raioKm,
    aceitaRetirada: d.aceitaRetirada,
    aceitaMoto: d.aceitaMoto,
    freteMotoCents: parseBRLToCents(d.freteMoto),
  });
  revalidatePath("/dashboard/configuracoes");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateAccountAction(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const session = await requirePharmacy();
  const raw = {
    razaoSocial: String(formData.get("razaoSocial") ?? ""),
    nomeFantasia: String(formData.get("nomeFantasia") ?? ""),
    email: String(formData.get("email") ?? ""),
  };
  const parsed = accountSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Verifique os dados.", fieldErrors: collect(parsed.error) };
  }
  pharmacyRepo.update(session.pharmacyId, {
    razaoSocial: parsed.data.razaoSocial,
    nomeFantasia: parsed.data.nomeFantasia,
    email: parsed.data.email,
  });
  revalidatePath("/dashboard/conta");
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