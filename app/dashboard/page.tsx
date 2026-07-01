import Link from "next/link";
import { ArrowRight, Pill, ShoppingCart, Calendar, Package, Bike, DollarSign } from "lucide-react";
import { requirePharmacy } from "@/services/auth-guard.service";
import { reportService } from "@/services/report.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChartCard, LineChartCard, PieChartCard } from "@/components/charts";
import { orderRepo } from "@/repositories";
import { formatBRL } from "@/lib/format";

export default async function DashboardPage() {
  const session = await requirePharmacy();
  const kpis = reportService.dashboardKpis(session.pharmacyId);
  const report = reportService.build(session.pharmacyId, "7d");

  const pieData = [
    { name: "Retirada", value: report.porRetirada },
    { name: "Moto", value: report.porMoto },
    { name: "Distribuição", value: report.porDistribuicao },
  ].filter((d) => d.value > 0);

  const recent = orderRepo.listByPharmacy(session.pharmacyId).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-[26px] font-bold">Dashboard</h1>
        <p className="text-body-sm text-muted-foreground">Visão geral da sua farmácia nos últimos 7 dias.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Produtos cadastrados" value={kpis.produtosCadastrados} icon={Pill} />
        <Kpi label="Vendidos hoje" value={kpis.vendidosHoje} icon={ShoppingCart} />
        <Kpi label="Vendidos no mês" value={kpis.vendidosMes} icon={Calendar} />
        <Kpi label="Aguardando retirada" value={kpis.aguardandoRetirada} icon={Package} />
        <Kpi label="Pedidos por moto" value={kpis.pedidosMoto} icon={Bike} />
        <Kpi label="Receita estimada" value={formatBRL(kpis.receitaEstimada)} icon={DollarSign} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <h2 className="mb-4 text-subtitle text-[16px] font-semibold">Vendas (7 dias)</h2>
          {report.vendasPorDia.length > 0 ? (
            <LineChartCard data={report.vendasPorDia} dataKey="quantidade" xKey="dia" label="Unidades" />
          ) : <Empty />}
        </Card>
        <Card>
          <h2 className="mb-4 text-subtitle text-[16px] font-semibold">Receita por dia</h2>
          <BarChartCard
            data={report.vendasPorDia.map((d) => ({ dia: d.dia, receita: Math.round(d.receitaCents / 100) }))}
            dataKey="receita" xKey="dia" label="R$"
          />
        </Card>
        <Card>
          <h2 className="mb-4 text-subtitle text-[16px] font-semibold">Pedidos por tipo</h2>
          {pieData.length > 0 ? <PieChartCard data={pieData} /> : <Empty />}
        </Card>
      </div>

      {/* Top produtos */}
      <Card>
        <h2 className="mb-4 text-subtitle text-[16px] font-semibold">Produtos mais vendidos</h2>
        {report.topProdutos.length === 0 ? <Empty /> : (
          <ul className="divide-y divide-border">
            {report.topProdutos.map((p, i) => (
              <li key={p.ean} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Badge tone="primary">{i + 1}º</Badge>
                  <div>
                    <p className="text-body font-medium">{p.nome}</p>
                    <p className="text-caption text-muted-foreground">EAN {p.ean}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-body font-medium">{p.quantidade} un.</p>
                  <p className="text-caption text-muted-foreground">{formatBRL(p.receitaCents)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Pedidos recentes */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-subtitle text-[16px] font-semibold">Pedidos recentes</h2>
          <Link href="/dashboard/pedidos" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary hover:underline">
            Ver todos <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
        {recent.length === 0 ? <Empty text="Nenhum pedido ainda." /> : (
          <ul className="divide-y divide-border">
            {recent.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <Link href={`/pedido/${o.id}`} className="text-body font-medium hover:text-primary">#{o.id.slice(0, 8)}</Link>
                <Badge tone={o.status === "finalizado" ? "success" : "primary"}>{o.status.replace("_", " ")}</Badge>
                <span className="text-body-sm text-muted-foreground">{o.tipoEntrega}</span>
                <span className="text-body font-medium">{formatBRL(o.precoTotalCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Kpi({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card className="flex flex-col gap-2">
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-soft-pink text-primary">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="text-[22px] font-bold leading-none">{value}</span>
      <span className="text-caption text-muted-foreground">{label}</span>
    </Card>
  );
}

function Empty({ text = "Sem dados suficientes." }: { text?: string }) {
  return <p className="py-8 text-center text-body-sm text-muted-foreground">{text}</p>;
}
