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
    imagePath: "/img/med-respiratorio.svg",
  },
  {
    ean: "7890000000002",
    nome: "Medicamento de Hipertensão",
    descricao: "Medicamento utilizado para controle da pressão arterial.",
    precoCents: 8990,
    quantidade: 80,
    imagePath: "/img/med-hipertensao.svg",
  },
  {
    ean: "7890000000003",
    nome: "Medicamento de Febre",
    descricao: "Medicamento para redução da febre e dores leves.",
    precoCents: 1990,
    quantidade: 250,
    imagePath: "/img/med-febre.svg",
  },
] as const;

export type AuthResult =
  | { ok: true; pharmacyId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export const authService = {
  async register(formData: FormData): Promise<AuthResult> {
    const raw = {
      cnpj: String(formData.get("cnpj") ?? ""),
      razaoSocial: String(formData.get("razaoSocial") ?? ""),
      nomeFantasia: String(formData.get("nomeFantasia") ?? ""),
      email: String(formData.get("email") ?? ""),
      senha: String(formData.get("senha") ?? ""),
      cep: String(formData.get("cep") ?? ""),
      logradouro: String(formData.get("logradouro") ?? ""),
      numero: String(formData.get("numero") ?? ""),
      complemento: String(formData.get("complemento") ?? ""),
      bairro: String(formData.get("bairro") ?? ""),
      cidade: String(formData.get("cidade") ?? ""),
      estado: String(formData.get("estado") ?? ""),
      faturamento: String(formData.get("faturamento") ?? ""),
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
    const passwordHash = bcrypt.hashSync(d.senha, 10);
    const coords = CEP_INFO[d.cep] ?? { lat: -23.5616, lng: -46.6561 };

    pharmacyRepo.create({
      id: pharmacyId,
      cnpj: d.cnpj,
      razaoSocial: d.razaoSocial,
      nomeFantasia: d.nomeFantasia,
      email: d.email,
      cep: d.cep,
      logradouro: d.logradouro,
      numero: d.numero,
      complemento: d.complemento ?? "",
      bairro: d.bairro,
      cidade: d.cidade,
      estado: d.estado,
      faturamento: d.faturamento,
      lat: coords.lat,
      lng: coords.lng,
    });

    pharmacyRepo.createSettings({
      id: randomUUID(),
      pharmacyId,
      cepBase: d.cep,
      raioKm: 10,
      aceitaRetirada: true,
      aceitaMoto: true,
      freteMotoCents: 599,
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
        nome: p.nome,
        descricao: p.descricao,
        precoCents: p.precoCents,
        quantidade: p.quantidade,
        imagePath: p.imagePath,
      });
    }

    await createSession({ userId, pharmacyId, role: "pharmacy_admin" });
    return { ok: true, pharmacyId };
  },

  async login(formData: FormData): Promise<AuthResult> {
    const raw = {
      email: String(formData.get("email") ?? ""),
      senha: String(formData.get("senha") ?? ""),
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
      return { ok: false, error: "Credenciais inválidas.", fieldErrors: { senha: ["Credenciais inválidas"] } };
    }
    const ok = bcrypt.compareSync(parsed.data.senha, user.passwordHash);
    if (!ok) {
      return { ok: false, error: "Credenciais inválidas.", fieldErrors: { senha: ["Credenciais inválidas"] } };
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