import "server-only";
import { orderRepo, productRepo } from "@/repositories";

export type ReportFilter = "hoje" | "ontem" | "7d" | "30d" | "custom";

export type ReportData = {
  totalVendido: number;
  receitaCents: number;
  porRetirada: number;
  porMoto: number;
  porDistribuicao: number;
  topProdutos: Array<{ nome: string; ean: string; quantidade: number; receitaCents: number }>;
  vendasPorDia: Array<{ dia: string; quantidade: number; receitaCents: number }>;
};

export const reportService = {
  build(pharmacyId: string, filter: ReportFilter, custom?: { from: number; to: number }): ReportData {
    const { from, to, days } = resolveRange(filter, custom);
    const orders = orderRepo.summaryForRange(pharmacyId, from, to);
    const items = orderRepo.itemsForRange(pharmacyId, from, to);

    const totalVendido = items.reduce((s, i) => s + i.quantidade, 0);
    const receitaCents = orders.reduce((s, o) => s + o.total, 0);
    const porRetirada = orders.filter((o) => o.tipoEntrega === "retirada").length;
    const porMoto = orders.filter((o) => o.tipoEntrega === "moto").length;
    const porDistribuicao = orders.filter((o) => o.tipoEntrega === "distribuicao").length;

    const topMap = new Map<string, { nome: string; quantidade: number; receitaCents: number }>();
    for (const it of items) {
      const cur = topMap.get(it.ean) ?? { nome: it.nome, quantidade: 0, receitaCents: 0 };
      cur.quantidade += it.quantidade;
      cur.receitaCents += it.unit * it.quantidade;
      topMap.set(it.ean, cur);
    }
    const topProdutos = [...topMap.entries()]
      .map(([ean, v]) => ({ ean, ...v }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);

    const vendasPorDia: Array<{ dia: string; quantidade: number; receitaCents: number }> = [];
    if (days > 0 && days <= 31) {
      const map = new Map<string, { quantidade: number; receitaCents: number }>();
      for (let i = 0; i < days; i++) {
        const d = new Date((from + i * 86400) * 1000);
        map.set(dKey(d), { quantidade: 0, receitaCents: 0 });
      }
      for (const it of items) {
        const k = dKey(it.createdAt);
        const cur = map.get(k) ?? { quantidade: 0, receitaCents: 0 };
        cur.quantidade += it.quantidade;
        cur.receitaCents += it.unit * it.quantidade;
        map.set(k, cur);
      }
      for (const [k, v] of map) vendasPorDia.push({ dia: k, ...v });
    }

    return {
      totalVendido,
      receitaCents,
      porRetirada,
      porMoto,
      porDistribuicao,
      topProdutos,
      vendasPorDia,
    };
  },

  dashboardKpis(pharmacyId: string) {
    return {
      produtosCadastrados: productRepo.listByPharmacy(pharmacyId).length,
      vendidosHoje: orderRepo.soldToday(pharmacyId),
      vendidosMes: orderRepo.soldThisMonth(pharmacyId),
      aguardandoRetirada: orderRepo.countByStatus(pharmacyId, "pronto_coleta"),
      pedidosMoto: countByTipo(pharmacyId, "moto"),
      receitaEstimada: orderRepo.revenueEstimate(pharmacyId),
    };
  },
};

function countByTipo(pharmacyId: string, tipo: "retirada" | "moto" | "distribuicao"): number {
  const list = orderRepo.listByPharmacy(pharmacyId);
  return list.filter((o) => o.tipoEntrega === tipo).length;
}

function resolveRange(filter: ReportFilter, custom?: { from: number; to: number }): {
  from: number;
  to: number;
  days: number;
} {
  const now = Math.floor(Date.now() / 1000);
  if (filter === "hoje") {
    const from = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
    return { from, to: now, days: 1 };
  }
  if (filter === "ontem") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const to = Math.floor(d.getTime() / 1000);
    const from = to - 86400;
    return { from, to, days: 1 };
  }
  if (filter === "7d") return { from: now - 7 * 86400, to: now, days: 7 };
  if (filter === "30d") return { from: now - 30 * 86400, to: now, days: 30 };
  if (custom) return { from: custom.from, to: custom.to, days: Math.max(1, Math.ceil((custom.to - custom.from) / 86400)) };
  return { from: now - 7 * 86400, to: now, days: 7 };
}

function dKey(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}