import type { Metadata } from "next";
import Link from "next/link";
import { Store, Motorbike, CircleCheck, ArrowRight } from "lucide-react";
import { CATEGORIES, DC_PHARMACY_ID } from "@/lib/constants";
import { categoryIcon } from "@/lib/category-icons";
import { productRepo, pharmacyRepo } from "@/repositories";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Reads live DB state (featured products, active-pharmacy count); must not be
// frozen at build time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Medicamentos perto de você",
};

export default function HomePage() {
  const distinct = productRepo.listDistinctEans();
  const featured = distinct.slice(0, 6).map((d) => {
    const rows = productRepo.getByEanGlobal(d.ean);
    const lowestPrice = rows.length > 0 ? Math.min(...rows.map((r) => r.priceCents)) : 0;
    const totalStock = rows.reduce((sum, r) => sum + r.quantity, 0);
    return {
      ean: d.ean,
      name: d.name,
      description: d.description,
      priceCents: lowestPrice,
      imagePath: defaultMedicineImage(),
      quantity: totalStock,
    };
  });
  const pharmacies = pharmacyRepo.allWithSettings().filter((p) => p.pharmacy.id !== DC_PHARMACY_ID);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="border-b border-border bg-soft-pink">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
          <div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body-sm font-medium text-primary-pressed">
              <span className="inline-flex items-center gap-1.5"><Store className="size-4" aria-hidden /> Retirada</span>
              <span className="inline-flex items-center gap-1.5"><Motorbike className="size-4" aria-hidden /> Motoentrega</span>
              <span className="inline-flex items-center gap-1.5"><CircleCheck className="size-4" aria-hidden /> Entrega de Parceiro</span>
            </div>
            <h1 className="mt-4 text-display font-bold tracking-tight text-balance">
              Medicamentos perto de você, com um <span className="text-primary">CEP</span>.
            </h1>
            <p className="mt-4 max-w-md text-body text-muted-foreground">
              Compare preços em farmácias próximas, escolha a retirada ou a entrega mais rápida e finalize em segundos.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/search"><Button size="lg">Buscar medicamentos</Button></Link>
              <Link href="/register"><Button size="lg" variant="secondary">Cadastrar minha farmácia</Button></Link>
            </div>
          </div>
          <form action="/search" role="search">
            <Card className="shadow-popover">
              <label htmlFor="q" className="mb-2 block text-label text-foreground">
                Busque por nome ou EAN
              </label>
              <Input id="q" name="q" type="search" placeholder="Ex.: Medicamento de Febre" className="h-14 text-body" />
              <Button type="submit" size="lg" className="mt-4 w-full">
                Buscar disponibilidade
              </Button>
              <p className="mt-4 text-center text-caption text-muted-foreground">
                {pharmacies.length} farmácia(s) ativa(s) na plataforma
              </p>
            </Card>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="mb-6 text-[28px] font-bold">Categorias</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const Icon = categoryIcon(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/search?cat=${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-5 text-center transition-colors duration-150 hover:border-primary/40 hover:bg-soft-pink"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-pill bg-soft-pink text-primary transition-colors duration-150 group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="text-body-sm font-medium">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-[28px] font-bold">Produtos em destaque</h2>
          <Link href="/search" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary hover:underline">
            Ver todos <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {featured.length === 0 ? (
          <Card className="text-center text-muted-foreground">
            Nenhum produto cadastrado. Crie sua farmácia para começar.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.ean} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Nearby pharmacies CTA */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="rounded-xl bg-primary p-8 text-primary-foreground md:p-12">
            <h2 className="text-[26px] font-bold md:text-[32px]">Tem uma farmácia?</h2>
            <p className="mt-2 max-w-lg text-body opacity-90">
              Cadastre-se, configure seu raio de atendimento e comece a atender pedidos locais usando seu próprio estoque.
            </p>
            <Link href="/register" className="mt-5 inline-block">
              <Button variant="secondary" size="lg">Quero vender</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function defaultMedicineImage(): string {
  return "/img/med-default.png";
}
