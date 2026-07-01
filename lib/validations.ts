import { z } from "zod";
import { parseBRLToCents } from "@/lib/format";
import { onlyDigits } from "@/lib/masks";
import { CATEGORIES, ESTADOS_BR, FATURAMENTO_OPCOES } from "@/lib/constants";

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const cepRegex = /^\d{5}-\d{3}$/;
const eanRegex = /^\d{13}$/;

function isValidCNPJ(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcCheckDigit = (base: string, weights: number[]): number => {
    const sum = base
      .split("")
      .reduce((acc, digit, i) => acc + Number(digit) * weights[i], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const base = digits.slice(0, 12);
  const digit1 = calcCheckDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calcCheckDigit(base + digit1, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits === `${base}${digit1}${digit2}`;
}

export const registerSchema = z.object({
  cnpj: z
    .string()
    .regex(cnpjRegex, { error: "CNPJ inválido" })
    .refine(isValidCNPJ, { error: "CNPJ inválido" }),
  razaoSocial: z.string().trim().min(3, { error: "Informe a razão social" }),
  nomeFantasia: z.string().trim().min(2, { error: "Informe o nome fantasia" }),
  email: z.email({ error: "E-mail inválido" }),
  senha: z
    .string()
    .min(8, { error: "A senha deve ter no mínimo 8 caracteres" }),
  cep: z.string().regex(cepRegex, { error: "CEP inválido" }),
  logradouro: z.string().trim().min(3, { error: "Endereço obrigatório" }),
  numero: z.string().trim().min(1, { error: "Número obrigatório" }),
  complemento: z.string().optional().default(""),
  bairro: z.string().trim().min(2, { error: "Bairro obrigatório" }),
  cidade: z.string().trim().min(2, { error: "Cidade obrigatória" }),
  estado: z.enum(ESTADOS_BR.map((e) => e.value) as [string, ...string[]], {
    error: "Selecione um estado válido",
  }),
  faturamento: z.enum(
    FATURAMENTO_OPCOES.map((o) => o.value) as [
      (typeof FATURAMENTO_OPCOES)[number]["value"],
      ...(typeof FATURAMENTO_OPCOES)[number]["value"][],
    ],
    { error: "Selecione o faturamento" }
  ),
});

export const loginSchema = z.object({
  email: z.email({ error: "E-mail inválido" }),
  senha: z.string().min(1, { error: "Informe a senha" }),
});

export const productSchema = z.object({
  ean: z.string().regex(eanRegex, { error: "EAN deve ter 13 dígitos" }),
  nome: z.string().min(3, { error: "Informe o nome" }),
  descricao: z.string().min(3, { error: "Informe a descrição" }),
  preco: z
    .string()
    .min(1, { error: "Preço inválido" })
    .refine((v) => parseBRLToCents(v) > 0, { error: "Informe um preço válido maior que zero" }),
  quantidade: z
    .string()
    .min(1, { error: "Quantidade inválida" })
    .refine((v) => onlyDigits(v).length > 0, { error: "Quantidade deve conter apenas números" }),
  imagePath: z.string().optional().default(""),
  category: z.enum(CATEGORIES.map((c) => c.slug) as [string, ...string[]], { error: "Selecione uma categoria" }),
});

export const settingsSchema = z.object({
  cepBase: z.string().regex(cepRegex, { error: "CEP inválido" }),
  raioKm: z.number().int().min(1).max(50),
  aceitaRetirada: z.boolean(),
  aceitaMoto: z.boolean(),
  freteMoto: z.string().min(1, { error: "Frete inválido" }),
});

export const accountSchema = z.object({
  razaoSocial: z.string().min(3, { error: "Razão social obrigatória" }),
  nomeFantasia: z.string().min(2, { error: "Nome fantasia obrigatório" }),
  email: z.email({ error: "E-mail inválido" }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type AccountInput = z.infer<typeof accountSchema>;