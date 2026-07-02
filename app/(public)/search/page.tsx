import type { Metadata } from "next";
import { CATEGORIES } from "@/lib/constants";
import { categoryIcon } from "@/lib/category-icons";
import { productRepo } from "@/repositories";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";

type SearchParams = Promise<{ q?: string; cat?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q, cat } = await searchParams;
  const query = (q ?? "").trim();
  const category = cat ?? "";
  const categoryLabel = CATEGORIES.find((c) => c.slug === category)?.label;

  let title = "Todos os medicamentos";
  if (query && categoryLabel) {
    title = `Resultados para "${query}" em ${categoryLabel}`;
  } else if (query) {
    title = `Resultados para "${query}"`;
  } else if (categoryLabel) {
    title = categoryLabel;
  }

  return { title };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, cat } = await searchParams;
  const query = (q ?? "").toLowerCase().trim();
  const category = cat ?? "";

  let list = await productRepo.listDistinctEans();

  if (query) {
    list = list.filter(
      (p) => p.name.toLowerCase().includes(query) || p.ean.includes(query)
    );
  }
  if (category) {
    list = list.filter((p) => p.category === category);
  }

  const products = await Promise.all(
    list.map(async (d) => {
      const rows = await productRepo.getByEanGlobal(d.ean);
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
    })
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 animate-fade-in">
      <h1 className="text-[28px] font-bold text-balance">
        {query && category
          ? `Resultados para "${q}" em ${CATEGORIES.find((c) => c.slug === category)?.label}`
          : query
            ? `Resultados para "${q}"`
            : category
              ? CATEGORIES.find((c) => c.slug === category)?.label
              : "Todos os medicamentos"}
      </h1>
      <p className="mt-1 text-body-sm text-muted-foreground">{products.length} produto(s) encontrado(s)</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Chip href="/search" active={!category}>Todos</Chip>
        {CATEGORIES.map((c) => {
          const Icon = categoryIcon(c.slug);
          return (
            <Chip key={c.slug} href={`/search?cat=${c.slug}`} active={category === c.slug}>
              <Icon className="size-3.5" aria-hidden /> {c.label}
            </Chip>
          );
        })}
      </div>

      {products.length === 0 ? (
        <Card className="mt-8 text-center text-muted-foreground">
          Nenhum medicamento encontrado. Tente outro termo.
        </Card>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.ean} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function defaultMedicineImage(): string {
  return "/img/med-default.png";
}
