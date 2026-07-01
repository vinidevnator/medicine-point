import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, CircleCheck, Package, PackageCheck } from "lucide-react";
import { orderRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stepper } from "@/components/ui/stepper";
import { formatBRL, formatDateTime, timeLabel } from "@/lib/format";
import { DELIVERY_TYPES, ORDER_STATUS_LABEL } from "@/lib/constants";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  // The order id is a capability URL exposing sensitive purchase data; keep it
  // out of search indexes.
  return { title: `Pedido ${id.slice(0, 8)}`, robots: { index: false, follow: false } };
}

const STEPS = [
  { label: "Pedido Liberado", description: "Pagamento confirmado e pedido liberado para preparo.", icon: CircleCheck },
  { label: "Pedido Montado", description: "Itens separados e conferidos pela farmácia.", icon: Package },
  { label: "Pedido Pronto para Coleta", description: "Aguardando retirada ou despacho.", icon: PackageCheck },
];

export default async function OrderPage({ params }: { params: Params }) {
  const { id } = await params;
  const detail = orderRepo.get(id);
  if (!detail) notFound();
  const { order, items } = detail;

  const current =
    order.status === "released" ? 0 :
    order.status === "assembled" ? 1 :
    order.status === "ready_pickup" || order.status === "completed" ? 2 : 0;

  const steps = STEPS.map((s, i) => ({
    ...s,
    at: i === 0 ? (order.stage1At ? Math.floor(order.stage1At.getTime() / 1000) : null) :
         i === 1 ? (order.stage2At ? Math.floor(order.stage2At.getTime() / 1000) : null) :
         (order.stage3At ? Math.floor(order.stage3At.getTime() / 1000) : null),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 animate-fade-in">
      <nav className="mb-4 flex items-center gap-1.5 text-body-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/search" className="hover:text-foreground">Medicamentos</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">Pedido</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-[26px] font-bold">Pedido #{order.id.slice(0, 8)}</h1>
        <Badge tone={order.status === "completed" ? "success" : "primary"}>
          {ORDER_STATUS_LABEL[order.status] ?? order.status}
        </Badge>
      </div>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Criado em {formatDateTime(Math.floor(order.createdAt.getTime() / 1000))} · {DELIVERY_TYPES[order.deliveryType].label} · {timeLabel(order.estimatedTimeMin)} · CEP {order.customerCep.slice(0,5)}-{order.customerCep.slice(5)}
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
                <p className="text-body font-medium">{it.name}</p>
                <p className="text-body-sm text-muted-foreground">EAN {it.ean} · {it.quantity} un.</p>
              </div>
              <span className="text-body font-medium">{formatBRL(it.unitPriceCents * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-body-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatBRL(order.totalPriceCents - order.shippingCents)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{order.shippingCents ? formatBRL(order.shippingCents) : "Grátis"}</span></div>
          <div className="flex justify-between text-body font-bold"><span>Total</span><span>{formatBRL(order.totalPriceCents)}</span></div>
        </div>
      </Card>

      <p className="mt-4 text-center text-body-sm text-muted-foreground">
        Sou a farmácia? <Link href="/dashboard/orders" className="text-primary hover:underline">Gerenciar no dashboard →</Link>
      </p>
    </div>
  );
}
