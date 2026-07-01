import { Store, Motorbike, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const DELIVERY_ICONS: Record<"pickup" | "moto" | "distribution", LucideIcon> = {
  pickup: Store,
  moto: Motorbike,
  distribution: Truck,
};
