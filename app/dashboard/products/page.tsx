import type { Metadata } from "next";
import Image from "next/image";
import { requirePharmacy } from "@/services/auth-guard.service";
import { productRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductFormDialog, DeleteProductButton } from "@/components/dashboard/product-dialog";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Produtos" };

export default async function ProductsPage() {
  const session = await requirePharmacy();
  const products = productRepo.listByPharmacy(session.pharmacyId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold">Produtos</h1>
          <p className="text-body-sm text-muted-foreground">{products.length} produto(s) cadastrado(s).</p>
        </div>
        <ProductFormDialog mode="create" label="Novo produto" />
      </div>

      {products.length === 0 ? (
        <Card className="text-center text-muted-foreground">
          Nenhum produto ainda. Cadastre seu primeiro medicamento.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <Image src={p.imagePath || "/img/med-default.png"} alt={p.name} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain p-2" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-body font-semibold leading-tight">{p.name}</h3>
                <Badge tone={p.quantity > 0 ? "success" : "danger"}>{p.quantity} un.</Badge>
              </div>
              <p className="line-clamp-2 text-body-sm text-muted-foreground">{p.description}</p>
              <div className="flex items-center justify-between text-body-sm text-muted-foreground">
                <span>EAN {p.ean}</span>
                <span className="text-[17px] font-bold text-foreground">{formatBRL(p.priceCents)}</span>
              </div>
              <div className="flex gap-2 border-t border-border pt-3">
                <ProductFormDialog
                  mode="edit"
                  label="Editar"
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  initial={{
                    id: p.id, ean: p.ean, name: p.name, description: p.description,
                    priceCents: p.priceCents, quantity: p.quantity, imagePath: p.imagePath,
                    category: p.category,
                  }}
                />
                <DeleteProductButton id={p.id} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
