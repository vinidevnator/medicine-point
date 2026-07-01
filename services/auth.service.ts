import "server-only";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { authRepo, pharmacyRepo, productRepo } from "@/repositories";
import { createSession, destroySession, getSession } from "@/lib/session";
import { registerSchema, loginSchema } from "@/lib/validations";
import { CEP_INFO } from "@/lib/cep-data";

const SEED_PRODUCTS = [
  {
    ean: "7890000000001",
    nome: "Medicamento Respiratório",
    descricao: "Medicamento utilizado para alívio dos sintomas respiratórios.",
    precoCents: 3990,
    quantidade: 100,
    imagePath: "/img/med-default.png",
    category: "respiratorio" as const,
  },
  {
    ean: "7890000000002",
    nome: "Medicamento de Hipertensão",
    descricao: "Medicamento utilizado para controle da pressão arterial.",
    precoCents: 8990,
    quantidade: 80,
    imagePath: "/img/med-default.png",
    category: "cardio" as const,
  },
  {
    ean: "7890000000003",
    nome: "Medicamento de Febre",
    descricao: "Medicamento para redução da febre e dores leves.",
    precoCents: 1990,
    quantidade: 250,
    imagePath: "/img/med-default.png",
    category: "analgesico" as const,
  },
] as const;

export type AuthResult =
  | { ok: true; pharmacyId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export const authService = {
  async register(formData: FormData): Promise<AuthResult> {
    const raw = {
      cnpj: String(formData.get("cnpj") ?? ""),
      legalName: String(formData.get("legalName") ?? ""),
      tradeName: String(formData.get("tradeName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      cep: String(formData.get("cep") ?? ""),
      street: String(formData.get("street") ?? ""),
      number: String(formData.get("number") ?? ""),
      complement: String(formData.get("complement") ?? ""),
      district: String(formData.get("district") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      revenue: String(formData.get("revenue") ?? ""),
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Verifique os campos do cadastro.",
        fieldErrors: zodErrors(parsed.error),
      };
    }
    const d = parsed.data;

    if (authRepo.findByEmail(d.email)) {
      return { ok: false, error: "E-mail já cadastrado.", fieldErrors: { email: ["E-mail já cadastrado"] } };
    }

    const pharmacyId = randomUUID();
    const userId = randomUUID();
    const passwordHash = bcrypt.hashSync(d.password, 10);
    const coords = CEP_INFO[d.cep] ?? { lat: -23.5616, lng: -46.6561 };

    pharmacyRepo.create({
      id: pharmacyId,
      cnpj: d.cnpj,
      legalName: d.legalName,
      tradeName: d.tradeName,
      email: d.email,
      cep: d.cep,
      street: d.street,
      number: d.number,
      complement: d.complement ?? "",
      district: d.district,
      city: d.city,
      state: d.state,
      revenue: d.revenue,
      lat: coords.lat,
      lng: coords.lng,
    });

    pharmacyRepo.createSettings({
      id: randomUUID(),
      pharmacyId,
      baseCep: d.cep,
      radiusKm: 10,
      acceptsPickup: true,
      acceptsMoto: true,
      motoShippingCents: 599,
    });

    authRepo.createUser({
      id: userId,
      email: d.email,
      passwordHash,
      role: "pharmacy_admin",
      pharmacyId,
    });

    for (const p of SEED_PRODUCTS) {
      productRepo.create({
        id: randomUUID(),
        pharmacyId,
        ean: p.ean,
        name: p.nome,
        description: p.descricao,
        priceCents: p.precoCents,
        quantity: p.quantidade,
        imagePath: p.imagePath,
        category: p.category,
      });
    }

    await createSession({ userId, pharmacyId, role: "pharmacy_admin" });
    return { ok: true, pharmacyId };
  },

  async login(formData: FormData): Promise<AuthResult> {
    const raw = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    };
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return {
        ok: false,
        error: "Verifique os campos de login.",
        fieldErrors: zodErrors(parsed.error),
      };
    }
    const user = authRepo.findByEmail(parsed.data.email);
    if (!user || !user.pharmacyId) {
      return { ok: false, error: "Credenciais inválidas.", fieldErrors: { password: ["Credenciais inválidas"] } };
    }
    const ok = bcrypt.compareSync(parsed.data.password, user.passwordHash);
    if (!ok) {
      return { ok: false, error: "Credenciais inválidas.", fieldErrors: { password: ["Credenciais inválidas"] } };
    }
    await createSession({ userId: user.id, pharmacyId: user.pharmacyId, role: user.role });
    return { ok: true, pharmacyId: user.pharmacyId };
  },

  async logout(): Promise<void> {
    await destroySession();
  },

  async current() {
    const session = await getSession();
    if (!session) return null;
    return session;
  },
};

function zodErrors(error: import("zod").ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "_";
    (out[key] ??= []).push(issue.message);
  }
  return out;
}