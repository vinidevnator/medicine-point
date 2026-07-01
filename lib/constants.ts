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