import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight, CircleCheck, Pill } from "lucide-react";
import { productRepo } from "@/repositories";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/format";
import { CATEGORIES } from "@/lib/constants";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { AvailabilityClient } from "./availability-client";

export const dynamicParams = true;

type Params = Promise<{ ean: string }>;

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label])
);

const TRUST_POINTS = [
  "Vendido por farmácias parceiras verificadas",
  "Retirada na loja ou entrega rápida por moto",
  "Preço de referência transparente, sem urgência forçada",
];

function CategoryGlyph({ slug, className }: { slug: string; className?: string }) {
  const Icon = CATEGORY_ICONS[slug] ?? Pill;
  return <Icon className={className} aria-hidden />;
}

export async function generateStaticParams() {
  return (await productRepo.listDistinctEans()).map((p) => ({ ean: p.ean }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { ean } = await params;
  const product = (await productRepo.getByEanGlobal(ean))[0];
  if (!product) return { title: "Medicamento não encontrado" };
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { ean } = await params;
  const product = (await productRepo.getByEanGlobal(ean))[0];
  if (!product) notFound();

  const categoryLabel = CATEGORY_LABELS[product.category] ?? "Medicamento";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 animate-fade-in">
      <nav className="mb-6 flex items-center gap-1.5 text-body-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href="/search" className="hover:text-foreground">Medicamentos</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
        {/* Image */}
        <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-lg bg-soft-pink/40 p-8 lg:min-h-[460px]">
          <div className="absolute size-72 rounded-pill bg-soft-pink" aria-hidden />
          <Image
            src={product.imagePath || "/img/med-default.png"}
            alt={product.name}
            width={320}
            height={320}
            sizes="(max-width:768px) 100vw, 50vw"
            className="relative z-10 h-auto max-h-[380px] w-auto object-contain"
            priority
          />
        </div>

        {/* Information */}
        <div>
          <Badge tone="primary">
            <CategoryGlyph slug={product.category} className="size-3" /> {categoryLabel}
          </Badge>
          <h1 className="mt-3 text-[32px] font-bold leading-tight tracking-tight text-balance">{product.name}</h1>
          <p className="mt-2 text-body text-muted-foreground">{product.description}</p>
          <p className="mt-4 text-[32px] font-bold text-primary">{formatBRL(product.priceCents)}</p>
          <p className="text-body-sm text-muted-foreground">preço de referência · varia por farmácia</p>

          <AvailabilityClient ean={product.ean} name={product.name} categoryLabel={categoryLabel} />
        </div>
      </div>

      {/* Description */}
      <section className="mt-16 rounded-lg bg-soft-pink/40 p-8 lg:p-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-title font-bold">Descrição do produto</h2>
            <p className="mt-4 text-body text-muted-foreground">{product.description}</p>
            <ul className="mt-4 space-y-2">
              {TRUST_POINTS.map((item) => (
                <li key={item} className="flex items-center gap-2 text-body-sm text-foreground">
                  <CircleCheck className="size-4 shrink-0 text-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-center">
            <div className="flex size-36 items-center justify-center rounded-pill bg-card shadow-hover">
              <CategoryGlyph slug={product.category} className="size-14 text-primary/40" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
