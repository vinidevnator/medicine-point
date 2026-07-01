import { Wind, HeartPulse, Bandage, Flower2, Pill, SprayCan } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  respiratorio: Wind,
  cardio: HeartPulse,
  analgesico: Bandage,
  antialergico: Flower2,
  vitamina: Pill,
  dermatologico: SprayCan,
};

export function categoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? Pill;
}
