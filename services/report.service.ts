import "server-only";
import { orderRepo, productRepo } from "@/repositories";
import { startOfDayUnix } from "@/lib/format";

export type ReportFilter = "today" | "yesterday" | "7d" | "30d" | "custom";

export type ReportData = {
  totalSold: number;
  revenueCents: number;
  byPickup: number;
  byMoto: number;
  byDistribution: number;
  topProducts: Array<{ name: string; ean: string; quantity: number; revenueCents: number }>;
  salesByDay: Array<{ day: string; quantity: number; revenueCents: number }>;
};

export const reportService = {
  async build(pharmacyId: string, filter: ReportFilter, custom?: { from: number; to: number }): Promise<ReportData> {
    const { from, to, days } = resolveRange(filter, custom);
    const [orders, items] = await Promise.all([
      orderRepo.summaryForRange(pharmacyId, from, to),
      orderRepo.itemsForRange(pharmacyId, from, to),
    ]);

    const totalSold = items.reduce((s, i) => s + i.quantity, 0);
    const revenueCents = orders.reduce((s, o) => s + o.total, 0);
    const byPickup = orders.filter((o) => o.deliveryType === "pickup").length;
    const byMoto = orders.filter((o) => o.deliveryType === "moto").length;
    const byDistribution = orders.filter((o) => o.deliveryType === "distribution").length;

    const topMap = new Map<string, { name: string; quantity: number; revenueCents: number }>();
    for (const it of items) {
      const cur = topMap.get(it.ean) ?? { name: it.name, quantity: 0, revenueCents: 0 };
      cur.quantity += it.quantity;
      cur.revenueCents += it.unit * it.quantity;
      topMap.set(it.ean, cur);
    }
    const topProducts = [...topMap.entries()]
      .map(([ean, v]) => ({ ean, ...v }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const salesByDay: Array<{ day: string; quantity: number; revenueCents: number }> = [];
    if (days > 0 && days <= 31) {
      const map = new Map<string, { quantity: number; revenueCents: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date((from + i * 86400) * 1000);
        map.set(dayKey(d), { quantity: 0, revenueCents: 0 });
      }
      for (const it of items) {
        const k = dayKey(it.createdAt);
        const cur = map.get(k) ?? { quantity: 0, revenueCents: 0 };
        cur.quantity += it.quantity;
        cur.revenueCents += it.unit * it.quantity;
        map.set(k, cur);
      }
      for (const [k, v] of map) salesByDay.push({ day: k, ...v });
    }

    return {
      totalSold,
      revenueCents,
      byPickup,
      byMoto,
      byDistribution,
      topProducts,
      salesByDay,
    };
  },

  async dashboardKpis(pharmacyId: string) {
    const [products, soldToday, soldThisMonth, awaitingPickup, motoOrders, estimatedRevenue] =
      await Promise.all([
        productRepo.listByPharmacy(pharmacyId),
        orderRepo.soldToday(pharmacyId),
        orderRepo.soldThisMonth(pharmacyId),
        orderRepo.countByStatus(pharmacyId, "ready_pickup"),
        countByType(pharmacyId, "moto"),
        orderRepo.revenueEstimate(pharmacyId),
      ]);
    return {
      registeredProducts: products.length,
      soldToday,
      soldThisMonth,
      awaitingPickup,
      motoOrders,
      estimatedRevenue,
    };
  },
};

async function countByType(pharmacyId: string, type: "pickup" | "moto" | "distribution"): Promise<number> {
  const list = await orderRepo.listByPharmacy(pharmacyId);
  return list.filter((o) => o.deliveryType === type).length;
}

function resolveRange(filter: ReportFilter, custom?: { from: number; to: number }): {
  from: number;
  to: number;
  days: number;
} {
  const now = Math.floor(Date.now() / 1000);
  if (filter === "today") {
    const from = startOfDayUnix();
    return { from, to: now, days: 1 };
  }
  if (filter === "yesterday") {
    const to = startOfDayUnix();
    const from = to - 86400;
    return { from, to, days: 1 };
  }
  if (filter === "7d") return { from: now - 7 * 86400, to: now, days: 7 };
  if (filter === "30d") return { from: now - 30 * 86400, to: now, days: 30 };
  if (custom) return { from: custom.from, to: custom.to, days: Math.max(1, Math.ceil((custom.to - custom.from) / 86400)) };
  return { from: now - 7 * 86400, to: now, days: 7 };
}

function dayKey(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}