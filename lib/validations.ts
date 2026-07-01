import { z } from "zod";

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const cepRegex = /^\d{5}-\d{3}$/;
const eanRegex = /^\d{13}$/;

export const registerSchema = z.object({
  cnpj: z.string().regex(cnpjRegex, { error: "CNPJ inválido" }),
  razaoSocial: z.string().min(3, { error: "Informe a razão social" }),
  nomeFantasia: z.string().min(2, { error: "Informe o nome fantasia" }),
  email: z.email({ error: "E-mail inválido" }),
  senha: z
    .string()
    .min(8, { error: "A senha deve ter no mínimo 8 caracteres" }),
  cep: z.string().regex(cepRegex, { error: "CEP inválido" }),
  logradouro: z.string().min(3, { error: "Endereço obrigatório" }),
  numero: z.string().min(1, { error: "Número obrigatório" }),
  complemento: z.string().optional().default(""),
  bairro: z.string().min(2, { error: "Bairro obrigatório" }),
  cidade: z.string().min(2, { error: "Cidade obrigatória" }),
  estado: z.string().length(2, { error: "UF inválida" }),
  faturamento: z.enum(["ate_50k", "50k_200k", "200k_500k", "acima_500k"], {
    error: "Selecione o faturamento",
  }),
});

export const loginSchema = z.object({
  email: z.email({ error: "E-mail inválido" }),
  senha: z.string().min(1, { error: "Informe a senha" }),
});

export const productSchema = z.object({
  ean: z.string().regex(eanRegex, { error: "EAN deve ter 13 dígitos" }),
  nome: z.string().min(3, { error: "Informe o nome" }),
  descricao: z.string().min(3, { error: "Informe a descrição" }),
  preco: z.string().min(1, { error: "Preço inválido" }),
  quantidade: z.string().min(1, { error: "Quantidade inválida" }),
  imagePath: z.string().optional().default(""),
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