import Image from "next/image";
import { requirePharmacy } from "@/services/auth-guard.service";
import { productRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductFormDialog, DeleteProductButton } from "@/components/dashboard/product-dialog";
import { formatBRL } from "@/lib/format";

export default async function ProdutosPage() {
  const session = await requirePharmacy();
  const products = productRepo.listByPharmacy(session.pharmacyId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">{products.length} produto(s) cadastrado(s).</p>
        </div>
        <div className="w-auto">
          <ProductFormDialog mode="create" trigger={<Button>+ Novo produto</Button>} />
        </div>
      </div>

      {products.length === 0 ? (
        <Card className="text-center text-muted-foreground">
          Nenhum produto ainda. Cadastre seu primeiro medicamento.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="flex flex-col gap-3 p-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <Image src={p.imagePath || "/img/med-generico.svg"} alt={p.nome} fill sizes="(max-width:768px) 100vw, 33vw" className="object-contain p-2" />
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight">{p.nome}</h3>
                <Badge tone={p.quantidade > 0 ? "success" : "danger"}>{p.quantidade} un.</Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.descricao}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>EAN {p.ean}</span>
                <span className="text-lg font-bold text-primary">{formatBRL(p.precoCents)}</span>
              </div>
              <div className="flex gap-2 border-t border-border pt-3">
                <ProductFormDialog
                  mode="edit"
                  initial={{
                    id: p.id, ean: p.ean, nome: p.nome, descricao: p.descricao,
                    precoCents: p.precoCents, quantidade: p.quantidade, imagePath: p.imagePath,
                  }}
                  trigger={<Button variant="outline" size="sm" className="flex-1">Editar</Button>}
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