"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL, tempoLabel } from "@/lib/format";
import { maskCEP } from "@/lib/masks";
import { buyNowAction } from "@/actions/orders";

type Offering = {
  pharmacyId: string;
  nomeFantasia: string;
  distanciaKm: number;
  quantidade: number;
  precoCents: number;
  tempoEstimadoMin: number;
  freteCents: number;
  tiposEntrega: Array<"retirada" | "moto" | "distribuicao">;
};

const TIPO_LABEL: Record<"retirada" | "moto" | "distribuicao", string> = {
  retirada: "Retirada",
  moto: "Moto",
  distribuicao: "Centro de distribuição",
};

export function AvailabilityClient({ ean }: { ean: string }) {
  const router = useRouter();
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [selected, setSelected] = useState<Offering | null>(null);
  const [tipo, setTipo] = useState<"retirada" | "moto" | "distribuicao">("retirada");
  const [quantidade, setQuantidade] = useState(1);
  const [erro, setErro] = useState("");
  const [pending, startTransition] = useTransition();
  const [comprado, setComprado] = useState<string | null>(null);

  async function buscar() {
    setErro("");
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setErro("Informe um CEP válido (8 dígitos).");
      return;
    }
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/pharmacies?ean=${ean}&cep=${clean}`);
      const json = await res.json();
      if (!res.ok) {
        setErro(json.error ?? "Falha na busca.");
        setOfferings([]);
        return;
      }
      setOfferings(json.offerings ?? []);
    } catch {
      setErro("Não foi possível buscar farmácias.");
    } finally {
      setLoading(false);
    }
  }

  function escolher(o: Offering) {
    setSelected(o);
    setTipo(o.tiposEntrega.includes("retirada") ? "retirada" : o.tiposEntrega[0]);
  }

  function comprar() {
    if (!selected) return;
    setComprado(null);
    setErro("");
    const formData = new FormData();
    formData.set("pharmacyId", selected.pharmacyId);
    formData.set("ean", ean);
    formData.set("cep", cep.replace(/\D/g, ""));
    formData.set("tipoEntrega", tipo);
    formData.set("quantidade", String(quantidade));
    startTransition(async () => {
      const res = await buyNowAction({ ok: false }, formData);
      if (res.ok && res.orderId) {
        setComprado(res.orderId);
        router.refresh();
      } else {
        setErro(res.error ?? "Não foi possível concluir a compra.");
      }
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          maxLength={9}
          onChange={(e) => setCep(maskCEP(e.target.value))}
          aria-label="CEP"
        />
        <Button type="button" onClick={buscar} disabled={loading}>
          {loading ? "Buscando…" : "Buscar disponibilidade"}
        </Button>
      </div>
      {erro && <p className="text-sm text-danger" role="alert">{erro}</p>}

      {offerings.length > 0 && (
        <ul className="space-y-3">
          {offerings.map((o) => (
            <li key={o.pharmacyId}>
              <button
                type="button"
                onClick={() => escolher(o)}
                className={`w-full rounded-lg border p-4 text-left transition ${selected?.pharmacyId === o.pharmacyId ? "border-primary bg-primary/5" : "border-border hover:bg-muted"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{o.nomeFantasia}</span>
                  {o.pharmacyId === "dc" ? <Badge tone="warning">Mais lenta</Badge> : <Badge tone="success">{o.distanciaKm} km</Badge>}
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>📦 {o.quantidade} un.</span>
                  <span className="font-semibold text-foreground">{formatBRL(o.precoCents)}</span>
                  <span>⏱️ {tempoLabel(o.tempoEstimadoMin)}</span>
                  {o.freteCents > 0 && <span>🏍️ frete {formatBRL(o.freteCents)}</span>}
                </div>
                <div className="mt-2 flex gap-1">
                  {o.tiposEntrega.map((t) => (
                    <Badge key={t} tone="default">{TIPO_LABEL[t]}</Badge>
                  ))}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <Card className="space-y-3 border-primary/40">
          <h3 className="font-semibold">Finalizar pedido em {selected.nomeFantasia}</h3>
          <label className="block text-sm font-medium">Tipo de entrega</label>
          <div className="flex flex-wrap gap-2">
            {selected.tiposEntrega.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                className={`rounded-full border px-3 py-1.5 text-sm ${tipo === t ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                {TIPO_LABEL[t]}
              </button>
            ))}
          </div>
          <label className="block text-sm font-medium">Quantidade</label>
          <Input
            type="number"
            min={1}
            max={selected.quantidade}
            value={quantidade}
            onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
            className="max-w-[120px]"
          />
          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">
              Total aproximado: <strong className="text-foreground">{formatBRL(selected.precoCents * quantidade + (tipo === "moto" ? selected.freteCents : 0))}</strong>
            </span>
            <Button onClick={comprar} disabled={pending}>{pending ? "Processando…" : "Comprar agora"}</Button>
          </div>
          {comprado && (
            <p className="text-sm text-success">
              Pedido criado! <a href={`/pedido/${comprado}`} className="font-semibold underline">Acompanhar pedido →</a>
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

// (BuyForm placeholder kept for future inline quick-buy block)