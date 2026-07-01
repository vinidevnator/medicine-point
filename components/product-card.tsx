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
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link href={`/medicamento/${product.ean}`} className="group block">
      <Card className="overflow-hidden p-0 transition hover:shadow-md hover:border-primary/40">
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={product.imagePath || "/img/med-generico.svg"}
            alt={product.nome}
            fill
            sizes="(max-width:768px) 100vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 font-semibold">{product.nome}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.descricao}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-primary">{formatBRL(product.precoCents)}</span>
            <Badge tone="success">Disponível</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}