import { Store, Motorbike, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DELIVERY_ICONS: Record<"retirada" | "moto" | "distribuicao", LucideIcon> = {
  retirada: Store,
  moto: Motorbike,
  distribuicao: Truck,
};
