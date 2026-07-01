import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { productRepo } from "@/repositories";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";

type SearchParams = Promise<{ q?: string; cat?: string }>;

export default async function BuscaPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, cat } = await searchParams;
  const query = (q ?? "").toLowerCase().trim();
  const category = cat ?? "";

  let list = productRepo.listDistinctEans();

  if (query) {
    list = list.filter(
      (p) => p.nome.toLowerCase().includes(query) || p.ean.includes(query)
    );
  }
  if (category) {
    list = list.filter((p) => p.category === category);
  }

  const products = list.map((d) => {
    const rows = productRepo.getByEanGlobal(d.ean);
    const lowestPrice = rows.length > 0 ? Math.min(...rows.map((r) => r.precoCents)) : 0;
    const totalStock = rows.reduce((sum, r) => sum + r.quantidade, 0);
    return {
      ean: d.ean,
      nome: d.nome,
      descricao: d.descricao,
      precoCents: lowestPrice,
      imagePath: imageFor(d.ean),
      quantidade: totalStock,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold">
        {query && category
          ? `Resultados para “${q}” em ${CATEGORIES.find((c) => c.slug === category)?.label}`
          : query
            ? `Resultados para “${q}”`
            : category
              ? CATEGORIES.find((c) => c.slug === category)?.label
              : "Todos os medicamentos"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{products.length} produto(s) encontrado(s)</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/busca" className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">Todos</Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/busca?cat=${c.slug}`}
            className={`rounded-full border px-3 py-1.5 text-xs ${category === c.slug ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}
          >
            {c.icon} {c.label}
          </Link>
        ))}
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

function imageFor(ean: string): string {
  const map: Record<string, string> = {
    "7890000000001": "/img/med-respiratorio.svg",
    "7890000000002": "/img/med-hipertensao.svg",
    "7890000000003": "/img/med-febre.svg",
  };
  return map[ean] ?? "/img/med-generico.svg";
}