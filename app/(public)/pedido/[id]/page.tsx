import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, CircleCheck, Package, PackageCheck } from "lucide-react";
import { orderRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";
import { formatBRL, formatDateTime, tempoLabel } from "@/lib/format";
import { DELIVERY_TIPOS } from "@/lib/constants";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Pedido ${id.slice(0, 8)}` };
}

const STEPS = [
  { label: "Pedido Liberado", description: "Pagamento confirmado e pedido liberado para preparo.", icon: CircleCheck },
  { label: "Pedido Montado", description: "Itens separados e conferidos pela farmácia.", icon: Package },
  { label: "Pedido Pronto para Coleta", description: "Aguardando retirada ou despacho.", icon: PackageCheck },
];

export default async function PedidoPage({ params }: { params: Params }) {
  const { id } = await params;
  const detail = orderRepo.get(id);
  if (!detail) notFound();
  const { order, items } = detail;

  const current =
    order.status === "liberado" ? 0 :
    order.status === "montado" ? 1 :
    order.status === "pronto_coleta" || order.status === "finalizado" ? 2 : 0;

  const steps = STEPS.map((s, i) => ({
    ...s,
    at: i === 0 ? (order.etapa1At ? Math.floor(order.etapa1At.getTime() / 1000) : null) :
         i === 1 ? (order.etapa2At ? Math.floor(order.etapa2At.getTime() / 1000) : null) :
         (order.etapa3At ? Math.floor(order.etapa3At.getTime() / 1000) : null),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 animate-fade-in">
      <nav className="mb-4 flex items-center gap-1.5 text-body-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/busca" className="hover:text-foreground">Medicamentos</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">Pedido</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[26px] font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        <Badge tone={order.status === "finalizado" ? "success" : "primary"}>
          {order.status.replace("_", " ")}
        </Badge>
      </div>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Criado em {formatDateTime(Math.floor(order.createdAt.getTime() / 1000))} · {DELIVERY_TIPOS[order.tipoEntrega].label} · {tempoLabel(order.tempoEstimadoMin)} · CEP {order.cepCliente.slice(0,5)}-{order.cepCliente.slice(5)}
      </p>

      <Card className="mt-6">
        <h2 className="mb-6 text-subtitle">Status do pedido</h2>
        <Stepper steps={steps} currentIndex={current} />
      </Card>

      <Card className="mt-6">
        <h2 className="mb-3 text-subtitle">Resumo</h2>
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-body font-medium">{it.nome}</p>
                <p className="text-body-sm text-muted-foreground">EAN {it.ean} · {it.quantidade} un.</p>
              </div>
              <span className="text-body font-medium">{formatBRL(it.precoUnitCents * it.quantidade)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-body-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(order.precoTotalCents - order.freteCents)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{order.freteCents ? formatBRL(order.freteCents) : "Grátis"}</span></div>
          <div className="flex justify-between text-body font-bold"><span>Total</span><span>{formatBRL(order.precoTotalCents)}</span></div>
        </div>
      </Card>

      <p className="mt-4 text-center text-body-sm text-muted-foreground">
        Sou a farmácia? <Link href="/dashboard/pedidos" className="text-primary hover:underline">Gerenciar no dashboard →</Link>
      </p>
    </div>
  );
}
