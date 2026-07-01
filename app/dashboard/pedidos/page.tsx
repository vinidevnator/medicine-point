import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requirePharmacy } from "@/services/auth-guard.service";
import { orderRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { advanceOrderAction } from "@/actions/orders";
import { formatBRL, formatDateTime } from "@/lib/format";
import { DELIVERY_TIPOS } from "@/lib/constants";

const NEXT_LABEL: Record<string, string | null> = {
  liberado: "Marcar como montado",
  montado: "Marcar pronto para coleta",
  pronto_coleta: "Finalizar pedido",
  finalizado: null,
};

export default async function PedidosPage() {
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
                  <Link href={`/pedido/${o.id}`} className="text-body font-semibold hover:text-primary">
                    Pedido #{o.id.slice(0, 8)}
                  </Link>
                  <Badge tone={o.status === "finalizado" ? "success" : "primary"}>
                    {o.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-body-sm text-muted-foreground">
                  <span>Entrega: {DELIVERY_TIPOS[o.tipoEntrega].label}</span>
                  <span>CEP: {o.cepCliente.slice(0,5)}-{o.cepCliente.slice(5)}</span>
                  <span>Criado: {formatDateTime(Math.floor(o.createdAt.getTime() / 1000))}</span>
                  <span className="font-semibold text-foreground">{formatBRL(o.precoTotalCents)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                  <Link href={`/pedido/${o.id}`}>
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
