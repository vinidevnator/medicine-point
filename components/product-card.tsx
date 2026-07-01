import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";

export type ProductCardData = {
  ean: string;
  name: string;
  description: string;
  priceCents: number;
  imagePath: string;
  quantity?: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const inStock = (product.quantity ?? 0) > 0;
  return (
    <Link href={`/medicine/${product.ean}`} className="group block focus-visible:outline-none">
      <Card
        interactive
        padded={false}
        className="overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[4/3] bg-muted">
          <Image
            src={product.imagePath || "/img/med-generico.svg"}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-body font-semibold">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-body-sm text-muted-foreground">{product.description}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-[19px] font-bold text-foreground">{formatBRL(product.priceCents)}</span>
            <Badge tone={inStock ? "success" : "danger"}>{inStock ? "Disponível" : "Esgotado"}</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
