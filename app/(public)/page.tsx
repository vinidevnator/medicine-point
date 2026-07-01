import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { productRepo, pharmacyRepo } from "@/repositories";
import { ProductCard } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const distinct = productRepo.listDistinctEans();
  const featured = distinct.slice(0, 6).map((d) => {
    const row = productRepo.getByEanGlobal(d.ean)[0];
    return {
      ean: d.ean,
      nome: d.nome,
      descricao: d.descricao,
      precoCents: row?.precoCents ?? 0,
      imagePath: imageFor(d.ean),
    };
  });
  const pharmacies = pharmacyRepo.allWithSettings();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-primary/10 via-card to-accent/10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              📍 Retire na loja · 🏍️ Motoentrega · 🚚 Centro de distribuição
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Medicamentos perto de você, com um <span className="text-primary">CEP</span>.
            </h1>
            <p className="mt-4 max-w-md text-lg text-muted-foreground">
              Compare preços em farmácias próximas, escolha a retirada ou a entrega mais rápida e finalize em segundos.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/busca"><Button size="lg">Buscar medicamentos</Button></Link>
              <Link href="/cadastrar"><Button size="lg" variant="outline">Cadastrar minha farmácia</Button></Link>
            </div>
          </div>
          <form action="/busca" className="w-full" role="search">
            <Card className="p-6 shadow-lg">
              <label htmlFor="q" className="mb-2 block text-sm font-medium">
                Busque por nome ou EAN
              </label>
              <input
                id="q"
                name="q"
                type="search"
                placeholder="Ex.: Medicamento de Febre"
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
              <button type="submit" className="mt-4 h-12 w-full rounded-lg bg-primary px-5 font-medium text-primary-foreground transition hover:opacity-90">
                Buscar disponibilidade
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {pharmacies.length} farmácia(s) ativa(s) na plataforma
              </p>
            </Card>
          </form>
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold">Categorias</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/busca?cat=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition hover:border-primary/40 hover:shadow-sm"
            >
              <span className="text-3xl" aria-hidden>{cat.icon}</span>
              <span className="text-sm font-medium">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Produtos em destaque */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Produtos em destaque</h2>
          <Link href="/busca" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
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

      {/* Farmácias próximas CTA */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-secondary p-8 text-primary-foreground md:p-12">
            <h2 className="text-2xl font-bold md:text-3xl">Tem uma farmácia?</h2>
            <p className="mt-2 max-w-lg opacity-90">
              Cadastre-se, configure seu raio de atendimento e comece a atender pedidos locais usando seu próprio estoque.
            </p>
            <Link href="/cadastrar" className="mt-4 inline-block">
              <Button variant="secondary" size="lg">Quero vender</Button>
            </Link>
          </div>
        </div>
      </section>
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