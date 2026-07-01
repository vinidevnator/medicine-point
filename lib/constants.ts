export const CATEGORIES = [
  { slug: "respiratorio", label: "Respiratório", icon: "🫁" },
  { slug: "cardio", label: "Cardiovascular", icon: "❤️" },
  { slug: "analgesico", label: "Analgésicos", icon: "🩹" },
  { slug: "antialergico", label: "Antialérgicos", icon: "🤧" },
  { slug: "vitamina", label: "Vitaminas", icon: "💊" },
  { slug: "dermatologico", label: "Dermatológico", icon: "🧴" },
] as const;

export const FATURAMENTO_OPCOES = [
  { value: "ate_50k", label: "até R$ 50 mil" },
  { value: "50k_200k", label: "R$ 50 mil até R$ 200 mil" },
  { value: "200k_500k", label: "R$ 200 mil até R$ 500 mil" },
  { value: "acima_500k", label: "acima de R$ 500 mil" },
] as const;

export const DELIVERY_TIPOS = {
  retirada: { label: "Retirada na loja", tempoMin: 30 },
  moto: { label: "Moto entrega", tempoMin: 120 },
  distribuicao: { label: "Centro de distribuição", tempoMin: 360 },
} as const;

export const SP_BBOX = { minLat: -23.9, maxLat: -23.3, minLng: -46.9, maxLng: -46.3 };

export const DC_PHARMACY_ID = "dc";

export const ESTADOS_BR = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const;