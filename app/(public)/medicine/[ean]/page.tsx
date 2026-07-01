import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import { productRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { AvailabilityClient } from "./availability-client";

export const dynamicParams = true;

type Params = Promise<{ ean: string }>;

export function generateStaticParams() {
  return productRepo.listDistinctEans().map((p) => ({ ean: p.ean }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { ean } = await params;
  const product = productRepo.getByEanGlobal(ean)[0];
  if (!product) return { title: "Medicamento não encontrado" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { ean } = await params;
  const product = productRepo.getByEanGlobal(ean)[0];
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 animate-fade-in">
      <nav className="mb-6 flex items-center gap-1.5 text-body-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/search" className="hover:text-foreground">Medicamentos</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <Card padded={false} className="relative aspect-square overflow-hidden bg-muted">
          <Image
            src={product.imagePath || "/img/med-generico.svg"}
            alt={product.name}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-contain p-6"
            priority
          />
        </Card>

        {/* Information */}
        <div>
          <Badge tone="primary">EAN {product.ean}</Badge>
          <h1 className="mt-3 text-[32px] font-bold tracking-tight text-balance">{product.name}</h1>
          <p className="mt-2 text-body text-muted-foreground">{product.description}</p>
          <p className="mt-4 text-[32px] font-bold text-primary">{formatBRL(product.priceCents)}</p>
          <p className="text-body-sm text-muted-foreground">preço de referência · varia por farmácia</p>

          <Card className="mt-6">
            <h2 className="text-subtitle">Disponibilidade por CEP</h2>
            <p className="text-body-sm text-muted-foreground">Informe seu CEP para ver farmácias próximas com estoque.</p>
            <AvailabilityClient ean={product.ean} />
          </Card>
        </div>
      </div>
    </div>
  );
}
