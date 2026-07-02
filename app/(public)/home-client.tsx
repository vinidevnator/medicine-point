"use client";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  Clock,
  MapPin,
  Motorbike,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { categoryIcon } from "@/lib/category-icons";
import { usePersona } from "@/components/persona-context";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type FeaturedProduct = ProductCardData & { pharmaciesWithStock: number };

const PHARMACY_STEPS = [
  {
    title: "Cadastre sua farmácia",
    description: "Crie sua conta em minutos com CNPJ e dados básicos do estabelecimento.",
  },
  {
    title: "Configure seu estoque",
    description: "Adicione seus medicamentos, preços e disponibilidade em tempo real.",
  },
  {
    title: "Receba pedidos",
    description: "Clientes da sua região encontram você e fazem pedidos diretamente.",
  },
];

const PHARMACY_BENEFITS = [
  { icon: Users, label: "Milhares de consumidores ativos" },
  { icon: BarChart3, label: "Painel de gestão completo" },
  { icon: Truck, label: "Retirada, motoentrega e Entrega de Parceiro" },
  { icon: ShieldCheck, label: "Dados protegidos e conformes com a LGPD" },
];

const PHARMACY_STATS = [
  { value: "+38%", label: "Aumento médio em vendas", icon: TrendingUp },
  { value: "12.400+", label: "Consumidores ativos", icon: Users },
  { value: "3min", label: "Tempo médio de cadastro", icon: Clock },
  { value: "98%", label: "Farmácias satisfeitas", icon: Star },
];

const CONSUMER_TRUST = [
  {
    icon: MapPin,
    title: "Perto de você",
    description: "Encontre farmácias próximas do seu endereço com estoque em tempo real.",
  },
  {
    icon: Truck,
    title: "Entrega rápida",
    description: "Retire na loja ou receba em casa. Você escolhe o que for mais conveniente.",
  },
  {
    icon: ShieldCheck,
    title: "Seguro e verificado",
    description: "Todas as farmácias são verificadas e seguem normas sanitárias vigentes.",
  },
];

export function HomeClient({
  featured,
  pharmacyCount,
}: {
  featured: FeaturedProduct[];
  pharmacyCount: number;
}) {
  const { persona, setPersona } = usePersona();
  const isConsumer = persona === "consumer";

  return (
    <div className="animate-fade-in">
      {/* Faixa contextual da persona */}
      <div
        className={`border-b border-border transition-colors duration-300 ${
          isConsumer ? "bg-soft-pink" : "bg-purple/10"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2 text-caption font-medium md:px-6">
          {isConsumer ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-primary-pressed">
                <MapPin className="size-3.5" aria-hidden />
                Informe seu CEP e encontre medicamentos próximos a você
              </span>
              <span className="hidden items-center gap-1.5 text-primary-pressed sm:inline-flex">
                <Truck className="size-3.5" aria-hidden />
                Entrega ou retirada em minutos
              </span>
              <span className="hidden items-center gap-1.5 text-primary-pressed md:inline-flex">
                <ShieldCheck className="size-3.5" aria-hidden />
                Compra segura e verificada
              </span>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-purple">
                <TrendingUp className="size-3.5" aria-hidden />
                Aumente suas vendas com a maior rede de farmácias online
              </span>
              <span className="hidden items-center gap-1.5 text-purple sm:inline-flex">
                <Users className="size-3.5" aria-hidden />
                Milhares de consumidores ativos na plataforma
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hero */}
      {isConsumer ? (
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
                  {pharmacyCount} farmácia(s) ativa(s) na plataforma
                </p>
              </Card>
            </form>
          </div>
        </section>
      ) : (
        <section className="border-b border-border bg-purple/10">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-6 md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-pill bg-purple px-3 py-1.5 text-caption font-semibold text-accent-foreground">
                <Sparkles className="size-3.5" aria-hidden />
                Plataforma para Farmácias
              </span>
              <h1 className="mt-4 text-display font-bold tracking-tight text-balance">
                Venda mais com o <span className="text-primary">CPV</span>.
              </h1>
              <p className="mt-4 max-w-md text-body text-muted-foreground">
                Cadastre-se, configure seu catálogo de medicamentos e comece a atender clientes da sua região usando seu próprio estoque — sem complicações.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/register"><Button size="lg">Cadastrar farmácia</Button></Link>
                <a href="#como-funciona">
                  <Button size="lg" variant="secondary">
                    Saiba como funciona <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </a>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {PHARMACY_BENEFITS.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-body-sm text-muted-foreground">
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <Card id="como-funciona" className="shadow-popover">
              <h2 className="text-subtitle">Como funciona em 3 passos</h2>
              <ol className="mt-5 space-y-5">
                {PHARMACY_STEPS.map(({ title, description }, i) => (
                  <li key={title} className="flex items-start gap-4">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-soft-pink text-body-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-body-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-0.5 text-caption text-muted-foreground">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <Link href="/register" className="mt-6 block">
                <Button size="lg" className="w-full">Cadastrar minha farmácia gratuitamente</Button>
              </Link>
              <p className="mt-4 text-center text-caption text-muted-foreground">
                {pharmacyCount} farmácia(s) ativa(s) na plataforma · Cancele quando quiser
              </p>
            </Card>
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-[28px] font-bold">Categorias</h2>
          {isConsumer && (
            <Link href="/search" className="inline-flex items-center gap-1 text-body-sm font-medium text-primary hover:underline">
              Ver todas <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
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

      {/* Produtos */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-[28px] font-bold">
              {isConsumer ? "Produtos em destaque" : "Produtos mais buscados"}
            </h2>
            {!isConsumer && (
              <p className="mt-1 text-body-sm text-muted-foreground">
                Mantenha esses itens no estoque para aumentar seus pedidos
              </p>
            )}
          </div>
          <Link href="/search" className="inline-flex shrink-0 items-center gap-1 text-body-sm font-medium text-primary hover:underline">
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
              <ProductCard
                key={p.ean}
                product={p}
                footnote={isConsumer ? undefined : `${p.pharmaciesWithStock} farmácia(s) com estoque`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Confiança / Resultados */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        {isConsumer ? (
          <>
            <h2 className="mb-8 text-center text-[28px] font-bold">Por que usar o CPV?</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CONSUMER_TRUST.map(({ icon: Icon, title, description }) => (
                <Card key={title} className="flex flex-col items-center gap-4 text-center">
                  <span className="inline-flex size-12 items-center justify-center rounded-md bg-soft-pink text-primary">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-body font-semibold">{title}</h3>
                    <p className="mt-1 text-body-sm text-muted-foreground">{description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="mb-8 text-center text-[28px] font-bold">Resultados reais para farmácias</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {PHARMACY_STATS.map(({ value, label, icon: Icon }) => (
                <Card key={label} interactive className="flex flex-col items-center gap-2 text-center">
                  <Icon className="size-6 text-primary" aria-hidden />
                  <span className="text-title font-bold text-primary md:text-headline">{value}</span>
                  <span className="text-caption text-muted-foreground">{label}</span>
                </Card>
              ))}
            </div>
            <p className="mt-4 text-center text-caption text-muted-foreground">
              Números demonstrativos (dados fictícios).
            </p>
          </>
        )}
      </section>

      {/* CTA final */}
      <section className="border-t border-border bg-muted">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center md:p-12">
            {isConsumer ? (
              <>
                <div>
                  <h2 className="text-[26px] font-bold md:text-[32px]">Tem uma farmácia?</h2>
                  <p className="mt-2 max-w-lg text-body opacity-90">
                    Cadastre-se, configure seu raio de atendimento e comece a atender pedidos locais usando seu próprio estoque.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="lg"
                  className="shrink-0"
                  onClick={() => setPersona("pharmacy")}
                >
                  <Store className="size-4" aria-hidden />
                  Quero vender
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-[26px] font-bold md:text-[32px]">Pronto para começar?</h2>
                  <p className="mt-2 max-w-lg text-body opacity-90">
                    Cadastre sua farmácia hoje e comece a receber pedidos de consumidores da sua região sem nenhum custo inicial.
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link href="/register">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Cadastrar farmácia
                      <ArrowRight className="size-4" aria-hidden />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    onClick={() => setPersona("consumer")}
                  >
                    <ShoppingCart className="size-4" aria-hidden />
                    Ver como consumidor
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
