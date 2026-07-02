"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Clock,
  Bike,
  MapPin,
  CircleCheck,
  Sparkles,
  CloudRain,
  CloudSun,
  Sun,
  Cloud,
  TriangleAlert,
  Truck,
  Store,
  Pencil,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChipButton } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/skeleton";
import { DELIVERY_ICONS } from "@/lib/delivery-icons";
import { formatBRL, timeLabel } from "@/lib/format";
import { maskCEP } from "@/lib/masks";
import { buyNowAction } from "@/actions/orders";

type DeliveryType = "pickup" | "moto" | "distribution";

type Offering = {
  pharmacyId: string;
  tradeName: string;
  distanceKm: number;
  quantity: number;
  priceCents: number;
  estimatedTimeMin: number;
  shippingCents: number;
  deliveryTypes: DeliveryType[];
  address: {
    street: string;
    number: string;
    complement: string | null;
    district: string;
    city: string;
    state: string;
    cep: string;
  } | null;
};

type WeatherSnapshot = {
  city: string;
  condition: string;
  temperatureC: number | null;
  precipitationMm: number | null;
  windKmh: number | null;
  heavyRain: boolean;
};

type DeliveryRecommendation = {
  bestOption: DeliveryType;
  pharmacyId: string;
  summary: string;
  rationale: string;
  weatherConsidered: string;
  weatherAlert: boolean;
};

type AdvisorState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; recommendation: DeliveryRecommendation; weather: WeatherSnapshot }
  | { status: "error" };

type Tab = "delivery" | "pickup";

const TYPE_LABEL: Record<DeliveryType, string> = {
  pickup: "Retirada",
  moto: "Moto",
  distribution: "Entrega de Parceiro",
};

const isDelivery = (t: DeliveryType) => t === "moto" || t === "distribution";

function formatAddress(addr: NonNullable<Offering["address"]>) {
  const parts = [
    `${addr.street}, ${addr.number}`,
    addr.complement || null,
    addr.district,
    `${addr.city} / ${addr.state}`,
    `CEP ${addr.cep.slice(0, 5)}-${addr.cep.slice(5)}`,
  ].filter(Boolean);
  return parts.join(" · ");
}

function WeatherIcon({ condition, heavyRain }: { condition: string; heavyRain: boolean }) {
  if (heavyRain) return <CloudRain className="size-4" aria-hidden />;
  if (condition.includes("nublado") || condition === "nublado") return <Cloud className="size-4" aria-hidden />;
  if (condition.includes("nuvens") || condition.includes("parcial")) return <CloudSun className="size-4" aria-hidden />;
  if (condition === "céu limpo") return <Sun className="size-4" aria-hidden />;
  return <Cloud className="size-4" aria-hidden />;
}

function PresentationCard({ name, categoryLabel }: { name: string; categoryLabel: string }) {
  return (
    <div className="min-w-[160px] cursor-default rounded-lg border-2 border-primary bg-card p-3">
      <p className="text-caption text-muted-foreground">Apresentação</p>
      <p className="line-clamp-2 text-body-sm font-semibold text-foreground">{name}</p>
      <p className="mt-2 text-caption text-muted-foreground">Categoria</p>
      <p className="text-body-sm font-semibold text-foreground">{categoryLabel}</p>
      <p className="mt-2 text-caption text-muted-foreground">Tipo</p>
      <p className="text-body-sm font-semibold text-foreground">Venda unitária</p>
    </div>
  );
}

export function AvailabilityClient({
  ean,
  name,
  categoryLabel,
}: {
  ean: string;
  name: string;
  categoryLabel: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selected, setSelected] = useState<Offering | null>(null);
  const [type, setType] = useState<DeliveryType>("pickup");
  const [activeTab, setActiveTab] = useState<Tab>("delivery");
  const [quantity, setQuantity] = useState(1);
  const [invalid, setInvalid] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [purchased, setPurchased] = useState<string | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorState>({ status: "idle" });

  const deliveryOfferings = offerings.filter((o) => o.deliveryTypes.some(isDelivery));
  const pickupOfferings = offerings.filter((o) => o.deliveryTypes.includes("pickup"));
  const hasDelivery = deliveryOfferings.length > 0;
  const hasPickup = pickupOfferings.length > 0;
  const hasResults = offerings.length > 0;
  const tabOfferings = activeTab === "delivery" ? deliveryOfferings : pickupOfferings;

  async function search() {
    setError("");
    setInvalid(false);
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setInvalid(true);
      return;
    }
    setLoading(true);
    setSelected(null);
    setAdvisor({ status: "idle" });
    try {
      const res = await fetch(`/api/pharmacies?ean=${ean}&cep=${clean}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Falha na busca.");
        setOfferings([]);
        setSearched(true);
        return;
      }
      const newOfferings: Offering[] = json.offerings ?? [];
      setOfferings(newOfferings);
      setSearched(true);
      if (newOfferings.length > 0) {
        const canDeliver = newOfferings.some((o) => o.deliveryTypes.some(isDelivery));
        setActiveTab(canDeliver ? "delivery" : "pickup");
        analyze(clean);
      }
    } catch {
      setError("Não foi possível buscar farmácias.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  async function analyze(clean: string) {
    setAdvisor({ status: "loading" });
    try {
      const res = await fetch("/api/delivery-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ean, cep: clean }),
      });
      const json = await res.json();
      if (!res.ok || !json.recommendation) {
        console.warn("Análise de IA indisponível:", json.error);
        setAdvisor({ status: "error" });
        return;
      }
      setAdvisor({ status: "ok", recommendation: json.recommendation, weather: json.weather });
    } catch (err) {
      console.warn("Análise de IA indisponível:", err);
      setAdvisor({ status: "error" });
    }
  }

  function resetCep() {
    setOfferings([]);
    setSelected(null);
    setAdvisor({ status: "idle" });
    setSearched(false);
    setError("");
    setInvalid(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function applyRecommendation(o: Offering, recommended: DeliveryType) {
    setActiveTab(isDelivery(recommended) ? "delivery" : "pickup");
    setSelected(o);
    setType(o.deliveryTypes.includes(recommended) ? recommended : o.deliveryTypes[0]);
    setQuantity((q) => Math.min(Math.max(1, q), o.quantity));
  }

  function choose(o: Offering) {
    setSelected(o);
    const preferred: DeliveryType =
      activeTab === "pickup" ? "pickup" : o.deliveryTypes.includes("moto") ? "moto" : "distribution";
    setType(o.deliveryTypes.includes(preferred) ? preferred : o.deliveryTypes[0]);
    setQuantity((q) => Math.min(Math.max(1, q), o.quantity));
  }

  function buy() {
    if (!selected) return;
    setPurchased(null);
    setError("");
    const qty = Math.min(Math.max(1, quantity), selected.quantity);
    const formData = new FormData();
    formData.set("pharmacyId", selected.pharmacyId);
    formData.set("ean", ean);
    formData.set("cep", cep.replace(/\D/g, ""));
    formData.set("deliveryType", type);
    formData.set("quantity", String(qty));
    startTransition(async () => {
      const res = await buyNowAction({ ok: false }, formData);
      if (res.ok && res.orderId) {
        setPurchased(res.orderId);
        router.refresh();
      } else {
        setError(res.error ?? "Não foi possível concluir a compra.");
      }
    });
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Presentation selector */}
      <div>
        <p className="mb-3 text-label font-semibold text-foreground">Selecione a apresentação:</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <PresentationCard name={name} categoryLabel={categoryLabel} />
        </div>
      </div>

      {/* Quantity */}
      <div>
        <p className="mb-2 text-label font-semibold text-foreground">Quantidade</p>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-2 py-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Diminuir quantidade"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Minus className="size-4" aria-hidden />
            </Button>
            <span className="w-6 text-center text-body font-semibold tabular-nums">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Aumentar quantidade"
              disabled={selected ? quantity >= selected.quantity : false}
              onClick={() => setQuantity((q) => (selected ? Math.min(selected.quantity, q + 1) : q + 1))}
            >
              <Plus className="size-4" aria-hidden />
            </Button>
          </div>
          {selected && (
            <span className="text-body-sm text-muted-foreground">
              {selected.quantity} un. disponíveis nesta farmácia
            </span>
          )}
        </div>
      </div>

      {/* Delivery / availability */}
      <div className="border-t border-border pt-6">
        <h2 className="text-subtitle">Disponibilidade por CEP</h2>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Informe seu CEP para ver farmácias próximas com estoque, frete e a melhor forma de entrega.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            search();
          }}
          className="mt-4 flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              inputMode="numeric"
              placeholder="00000-000"
              value={cep}
              maxLength={9}
              invalid={invalid}
              onChange={(e) => {
                setCep(maskCEP(e.target.value));
                if (invalid) setInvalid(false);
              }}
              aria-label="CEP"
              className={hasResults ? "pr-11" : undefined}
            />
            {hasResults && (
              <button
                type="button"
                onClick={resetCep}
                title="Alterar CEP"
                aria-label="Alterar CEP"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary transition-colors hover:text-primary-hover"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
            )}
          </div>
          <Button type="submit" loading={loading} className="sm:shrink-0">
            {loading ? "Consultando…" : "Calcular"}
          </Button>
        </form>

        {invalid && (
          <p className="mt-2 flex items-center gap-1.5 text-body-sm text-danger" role="alert">
            <TriangleAlert className="size-4 shrink-0" aria-hidden /> CEP inválido. Informe 8 dígitos.
          </p>
        )}
        {error && (
          <p className="mt-2 text-body-sm text-danger" role="alert">
            {error}
          </p>
        )}
        {!hasResults && !loading && (
          <a href="#" className="mt-1.5 inline-block text-body-sm text-primary hover:underline">
            Não sei meu CEP
          </a>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="mt-4 space-y-3">
            <Skeleton className="h-11 w-full rounded-pill" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && !hasResults && !error && (
          <Card className="mt-4 flex items-start gap-3 border-warning/40 bg-warning/5">
            <X className="mt-0.5 size-5 shrink-0 text-warning-ink" aria-hidden />
            <div>
              <p className="text-body font-semibold text-foreground">Indisponível para este CEP</p>
              <p className="mt-0.5 text-body-sm text-muted-foreground">
                No momento não há farmácias com estoque para entrega ou retirada em <strong>{cep}</strong>.
              </p>
            </div>
          </Card>
        )}

        {/* AI advisor */}
        {advisor.status === "loading" && (
          <Card className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-body-sm font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" aria-hidden /> Analisando a melhor opção…
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        )}

        {advisor.status === "ok" && (() => {
          const { recommendation, weather } = advisor;
          const target = offerings.find((o) => o.pharmacyId === recommendation.pharmacyId);
          return (
            <Card className="mt-4 space-y-3 border-primary/40 bg-soft-pink/30">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-pressed">
                  <Sparkles className="size-4" aria-hidden /> Análise inteligente
                </span>
                <Badge tone={recommendation.weatherAlert ? "warning" : "info"}>
                  <WeatherIcon condition={weather.condition} heavyRain={weather.heavyRain} />
                  {weather.condition}
                  {weather.temperatureC !== null ? ` · ${Math.round(weather.temperatureC)}°C` : ""}
                </Badge>
              </div>
              <p className="text-body font-semibold text-foreground">{recommendation.summary}</p>
              <p className="text-body-sm text-muted-foreground">{recommendation.rationale}</p>
              {recommendation.bestOption === "pickup" && target && (
                <p className="flex items-start gap-1.5 text-body-sm font-medium text-foreground">
                  <Store className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> Retirar em <strong>{target.tradeName}</strong>
                </p>
              )}
              {recommendation.weatherAlert && (
                <p className="flex items-start gap-1.5 text-body-sm text-warning-ink">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {recommendation.weatherConsidered}
                </p>
              )}
              {target && (
                <Button size="sm" variant="secondary" onClick={() => applyRecommendation(target, recommendation.bestOption)}>
                  Usar esta recomendação
                </Button>
              )}
            </Card>
          );
        })()}

        {/* Tabs + offerings */}
        {hasResults && (
          <div className="mt-4">
            <div className="mb-3 flex gap-2" role="tablist" aria-label="Forma de recebimento">
              <ChipButton
                role="tab"
                aria-selected={activeTab === "delivery"}
                active={activeTab === "delivery"}
                disabled={!hasDelivery}
                className="flex-1 justify-center disabled:opacity-50 disabled:pointer-events-none"
                onClick={() => setActiveTab("delivery")}
              >
                <Truck className="size-4" aria-hidden /> Receber em casa
              </ChipButton>
              <ChipButton
                role="tab"
                aria-selected={activeTab === "pickup"}
                active={activeTab === "pickup"}
                disabled={!hasPickup}
                className="flex-1 justify-center disabled:opacity-50 disabled:pointer-events-none"
                onClick={() => setActiveTab("pickup")}
              >
                <Store className="size-4" aria-hidden /> Retirar na farmácia
              </ChipButton>
            </div>

            {tabOfferings.length > 0 ? (
              <ul className="space-y-3">
                {tabOfferings.map((o) => (
                  <li key={o.pharmacyId}>
                    <button type="button" onClick={() => choose(o)} className="w-full text-left">
                      <Card
                        interactive
                        selected={selected?.pharmacyId === o.pharmacyId}
                        className={selected?.pharmacyId === o.pharmacyId ? "bg-soft-pink/40" : undefined}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-body font-semibold">{o.tradeName}</span>
                          <div className="flex items-center gap-1.5">
                            {advisor.status === "ok" && advisor.recommendation.pharmacyId === o.pharmacyId && (
                              <Badge tone="primary">
                                <Sparkles className="size-3" aria-hidden /> Recomendado
                              </Badge>
                            )}
                            {o.pharmacyId === "dc" ? (
                              <Badge tone="warning">Mais lenta</Badge>
                            ) : (
                              <Badge tone="success">
                                <MapPin className="size-3" aria-hidden /> {o.distanceKm} km
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-body-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5"><Package className="size-4" aria-hidden /> {o.quantity} un.</span>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">{formatBRL(o.priceCents)}</span>
                          <span className="inline-flex items-center gap-1.5"><Clock className="size-4" aria-hidden /> {timeLabel(o.estimatedTimeMin)}</span>
                          {o.shippingCents > 0 && (
                            <span className="inline-flex items-center gap-1.5"><Bike className="size-4" aria-hidden /> frete {formatBRL(o.shippingCents)}</span>
                          )}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {o.deliveryTypes.map((t) => (
                            <Badge key={t} tone="default">{TYPE_LABEL[t]}</Badge>
                          ))}
                        </div>
                      </Card>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <Card className="text-body-sm text-muted-foreground">
                {activeTab === "delivery" ? (
                  <span className="inline-flex items-center gap-1.5"><Truck className="size-4" aria-hidden /> Entrega em casa não disponível para este CEP.</span>
                ) : (
                  <span className="inline-flex items-center gap-1.5"><Store className="size-4" aria-hidden /> Retirada em farmácia não disponível para este CEP.</span>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Finalize / buy */}
        {selected && (
          <Card selected className="mt-4 space-y-4">
            <h3 className="text-body font-semibold">Finalizar pedido em {selected.tradeName}</h3>
            <div>
              <p className="mb-2 text-label text-foreground">Tipo de entrega</p>
              <div className="flex flex-wrap gap-2">
                {selected.deliveryTypes.map((t) => {
                  const Icon = DELIVERY_ICONS[t];
                  return (
                    <ChipButton key={t} active={type === t} onClick={() => setType(t)}>
                      <Icon className="size-3.5" aria-hidden /> {TYPE_LABEL[t]}
                    </ChipButton>
                  );
                })}
              </div>
            </div>
            {type === "pickup" && selected.address && (
              <div className="flex items-start gap-2 rounded-lg bg-soft-pink/40 p-3 text-body-sm text-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{formatAddress(selected.address)}</span>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-body-sm text-muted-foreground">
                {quantity} un. · Total aproximado:{" "}
                <strong className="text-body font-semibold text-foreground">
                  {formatBRL(selected.priceCents * quantity + (type === "moto" ? selected.shippingCents : 0))}
                </strong>
              </span>
              <Button onClick={buy} loading={pending}>{pending ? "Processando…" : "Comprar agora"}</Button>
            </div>
            {purchased && (
              <p className="flex items-center gap-1.5 text-body-sm text-success">
                <CircleCheck className="size-4 shrink-0" aria-hidden /> Pedido criado!{" "}
                <a href={`/order/${purchased}`} className="font-semibold underline underline-offset-2">Acompanhar pedido</a>
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
