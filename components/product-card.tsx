import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";

export type ProductCardData = {
  ean: string;
  nome: string;
  descricao: string;
  precoCents: number;
  imagePath: string;
  quantidade?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const inStock = (product.quantidade ?? 0) > 0;
  return (
    <Link href={`/medicamento/${product.ean}`} className="group block focus-visible:outline-none">
      <Card
        interactive
        padded={false}
        className="overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={product.imagePath || "/img/med-generico.svg"}
            alt={product.nome}
            fill
            sizes="(max-width:768px) 100vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-body font-semibold">{product.nome}</h3>
          <p className="mt-1 line-clamp-2 text-body-sm text-muted-foreground">{product.descricao}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[19px] font-bold text-foreground">{formatBRL(product.precoCents)}</span>
            <Badge tone={inStock ? "success" : "danger"}>{inStock ? "Disponível" : "Esgotado"}</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
