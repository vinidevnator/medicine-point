"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Package, Clock, Bike, MapPin, CircleCheck, Sparkles, CloudRain, CloudSun, Sun, Cloud, TriangleAlert } from "lucide-react";
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

type Offering = {
  pharmacyId: string;
  tradeName: string;
  distanceKm: number;
  quantity: number;
  priceCents: number;
  estimatedTimeMin: number;
  shippingCents: number;
  deliveryTypes: Array<"pickup" | "moto" | "distribution">;
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
  bestOption: "pickup" | "moto" | "distribution";
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

const TYPE_LABEL: Record<"pickup" | "moto" | "distribution", string> = {
  pickup: "Retirada",
  moto: "Moto",
  distribution: "Centro de distribuição",
};

function WeatherIcon({ condition, heavyRain }: { condition: string; heavyRain: boolean }) {
  if (heavyRain) return <CloudRain className="size-4" aria-hidden />;
  if (condition.includes("nublado") || condition === "nublado") return <Cloud className="size-4" aria-hidden />;
  if (condition.includes("nuvens") || condition.includes("parcial")) return <CloudSun className="size-4" aria-hidden />;
  if (condition === "céu limpo") return <Sun className="size-4" aria-hidden />;
  return <Cloud className="size-4" aria-hidden />;
}

export function AvailabilityClient({ ean }: { ean: string }) {
  const router = useRouter();
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selected, setSelected] = useState<Offering | null>(null);
  const [type, setType] = useState<"pickup" | "moto" | "distribution">("pickup");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [purchased, setPurchased] = useState<string | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorState>({ status: "idle" });

  async function search() {
    setError("");
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setError("Informe um CEP válido (8 dígitos).");
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
        return;
      }
      const newOfferings: Offering[] = json.offerings ?? [];
      setOfferings(newOfferings);
      if (newOfferings.length > 0) analyze(clean);
    } catch {
      setError("Não foi possível buscar farmácias.");
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

  function applyRecommendation(o: Offering, recommended: "pickup" | "moto" | "distribution") {
    setSelected(o);
    setType(o.deliveryTypes.includes(recommended) ? recommended : o.deliveryTypes[0]);
  }

  function choose(o: Offering) {
    setSelected(o);
    setType(o.deliveryTypes.includes("pickup") ? "pickup" : o.deliveryTypes[0]);
  }

  function buy() {
    if (!selected) return;
    setPurchased(null);
    setError("");
    const formData = new FormData();
    formData.set("pharmacyId", selected.pharmacyId);
    formData.set("ean", ean);
    formData.set("cep", cep.replace(/\D/g, ""));
    formData.set("deliveryType", type);
    formData.set("quantity", String(quantity));
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
    <div className="mt-4 space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <Input
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          maxLength={9}
          onChange={(e) => setCep(maskCEP(e.target.value))}
          aria-label="CEP"
        />
        <Button type="submit" loading={loading} className="sm:shrink-0">
          {loading ? "Buscando…" : "Buscar disponibilidade"}
        </Button>
      </form>
      {error && <p className="text-body-sm text-danger" role="alert">{error}</p>}

      {advisor.status === "loading" && (
        <Card className="space-y-3">
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
          <Card className="space-y-3 border-primary/40 bg-soft-pink/30">
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
            {recommendation.weatherAlert && (
              <p className="flex items-start gap-1.5 text-body-sm text-warning-ink">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {recommendation.weatherConsidered}
              </p>
            )}
            {target && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => applyRecommendation(target, recommendation.bestOption)}
              >
                Usar esta recomendação
              </Button>
            )}
          </Card>
        );
      })()}

      {offerings.length > 0 && (
        <ul className="space-y-3">
          {offerings.map((o) => (
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
      )}

      {selected && (
        <Card selected className="space-y-4">
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
          <div>
            <p className="mb-2 text-label text-foreground">Quantidade</p>
            <Input
              type="number"
              min={1}
              max={selected.quantity}
              value={quantity}
              onChange={(e) => {
                const n = Number(e.target.value);
                setQuantity(Number.isFinite(n) ? Math.max(1, Math.min(selected.quantity, n)) : 1);
              }}
              className="max-w-[120px]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <span className="text-body-sm text-muted-foreground">
              Total aproximado: <strong className="text-body font-semibold text-foreground">{formatBRL(selected.priceCents * quantity + (type === "moto" ? selected.shippingCents : 0))}</strong>
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
  );
}
