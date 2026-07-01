import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
    title: product.nome,
    description: product.descricao,
    openGraph: { title: product.nome, description: product.descricao },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { ean } = await params;
  const product = productRepo.getByEanGlobal(ean)[0];
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-in">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link> ›{" "}
        <Link href="/busca" className="hover:text-foreground">Medicamentos</Link> ›{" "}
        <span className="text-foreground">{product.nome}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Imagem */}
        <Card className="relative aspect-square overflow-hidden bg-muted p-0">
          <Image
            src={product.imagePath || "/img/med-generico.svg"}
            alt={product.nome}
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-contain p-6"
            priority
          />
        </Card>

        {/* Informações */}
        <div>
          <Badge tone="primary">EAN {product.ean}</Badge>
          <h1 className="mt-3 text-3xl font-bold">{product.nome}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{product.descricao}</p>
          <p className="mt-4 text-4xl font-bold text-primary">{formatBRL(product.precoCents)}</p>
          <p className="text-sm text-muted-foreground">preço de referência · varia por farmácia</p>

          <Card className="mt-6">
            <h2 className="text-lg font-semibold">Disponibilidade por CEP</h2>
            <p className="text-sm text-muted-foreground">Informe seu CEP para ver farmácias próximas com estoque.</p>
            <AvailabilityClient ean={product.ean} />
          </Card>
        </div>
      </div>
    </div>
  );
}