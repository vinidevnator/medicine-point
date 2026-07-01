import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requirePharmacy } from "@/services/auth-guard.service";
import { orderRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { advanceOrderAction } from "@/actions/orders";
import { formatBRL, formatDateTime } from "@/lib/format";
import { DELIVERY_TYPES } from "@/lib/constants";

const NEXT_LABEL: Record<string, string | null> = {
  released: "Marcar como montado",
  assembled: "Marcar pronto para coleta",
  ready_pickup: "Finalizar pedido",
  completed: null,
};

export default async function OrdersPage() {
  const session = await requirePharmacy();
  const orders = orderRepo.listByPharmacy(session.pharmacyId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-[26px] font-bold">Pedidos</h1>
        <p className="text-body-sm text-muted-foreground">{orders.length} pedido(s).</p>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center text-muted-foreground">Nenhum pedido ainda.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {orders.map((o) => {
            const next = NEXT_LABEL[o.status];
            return (
              <Card key={o.id} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Link href={`/order/${o.id}`} className="text-body font-semibold hover:text-primary">
                    Pedido #{o.id.slice(0, 8)}
                  </Link>
                  <Badge tone={o.status === "completed" ? "success" : "primary"}>
                    {o.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-body-sm text-muted-foreground">
                  <span>Entrega: {DELIVERY_TYPES[o.deliveryType].label}</span>
                  <span>CEP: {o.customerCep.slice(0,5)}-{o.customerCep.slice(5)}</span>
                  <span>Criado: {formatDateTime(Math.floor(o.createdAt.getTime() / 1000))}</span>
                  <span className="font-semibold text-foreground">{formatBRL(o.totalPriceCents)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <Link href={`/order/${o.id}`}>
                    <Button variant="secondary" size="sm">
                      Ver status <ArrowRight className="size-3.5" aria-hidden />
                    </Button>
                  </Link>
                  {next && (
                    <form action={advanceOrderAction}>
                      <input type="hidden" name="id" value={o.id} />
                      <Button type="submit" size="sm">{next}</Button>
                    </form>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
