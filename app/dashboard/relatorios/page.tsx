import { requirePharmacy } from "@/services/auth-guard.service";
import { reportService, type ReportFilter } from "@/services/report.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChartCard, LineChartCard, PieChartCard } from "@/components/charts";
import { ReportFilters } from "@/components/dashboard/report-filters";
import { formatBRL, parseDateInputToUnix } from "@/lib/format";

type SearchParams = Promise<{ f?: string; from?: string; to?: string }>;

export default async function RelatoriosPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await requirePharmacy();
  const { f, from, to } = await searchParams;
  const filter = (f as ReportFilter | undefined) ?? "7d";
  const fromTs = from ? parseDateInputToUnix(from) : null;
  const toTs = to ? parseDateInputToUnix(to) : null;
  const custom = fromTs !== null && toTs !== null ? { from: fromTs, to: toTs + 86399 } : undefined;
  const okFilters: ReportFilter[] = ["hoje", "ontem", "7d", "30d", "custom"];
  const safeFilter = okFilters.includes(filter as ReportFilter) ? filter : "7d";
  const report = reportService.build(session.pharmacyId, safeFilter, custom);

  const pieData = [
    { name: "Retirada", value: report.porRetirada },
    { name: "Moto", value: report.porMoto },
    { name: "Distribuição", value: report.porDistribuicao },
  ].filter((d) => d.value > 0);
  const topBar = report.topProdutos.map((p) => ({ name: p.nome.slice(0, 14), quantidade: p.quantidade }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Acompanhe vendas e receita.</p>
        </div>
        <ReportFilters current={safeFilter} />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Stat label="Produtos vendidos" value={report.totalVendido} />
        <Stat label="Receita" value={formatBRL(report.receitaCents)} />
        <Stat label="Pedidos por retirada" value={report.porRetirada} />
        <Stat label="Pedidos por moto" value={report.porMoto} />
        <Stat label="Pedidos por distribuição" value={report.porDistribuicao} />
        <Stat label="Itens no topo" value={report.topProdutos.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Vendas por dia</h2>
          {report.vendasPorDia.length > 0 ? (
            <LineChartCard data={report.vendasPorDia} dataKey="quantidade" xKey="dia" label="Unidades" />
          ) : <Empty />}
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Produtos mais vendidos</h2>
          {topBar.length > 0 ? <BarChartCard data={topBar} dataKey="quantidade" xKey="name" label="Unidades" /> : <Empty />}
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Pedidos por tipo de entrega</h2>
          {pieData.length > 0 ? <PieChartCard data={pieData} /> : <Empty />}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">Top 5 produtos</h2>
          {report.topProdutos.length === 0 ? <Empty /> : (
            <ul className="divide-y divide-border">
              {report.topProdutos.map((p, i) => (
                <li key={p.ean} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <Badge tone="primary">{i + 1}º</Badge>
                    <span className="text-sm">{p.nome}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{p.quantidade} un · {formatBRL(p.receitaCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </Card>
  );
}
function Empty({ text = "Sem dados no período." }: { text?: string }) {
  return <p className="py-10 text-center text-sm text-muted-foreground">{text}</p>;
}