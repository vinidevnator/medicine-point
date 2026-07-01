"use client";
import { useActionState, useState } from "react";
import { CircleCheck, AlertCircle, Store, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { cn } from "@/lib/cn";
import { maskCEP } from "@/lib/masks";
import { updateSettingsAction, type SettingsState } from "@/actions/settings";

export function SettingsForm({ initial }: {
  initial: { cepBase: string; raioKm: number; aceitaRetirada: boolean; aceitaMoto: boolean; freteMotoCents: number };
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateSettingsAction, { ok: false });
  const [raio, setRaio] = useState(initial.raioKm);
  const [cep, setCep] = useState(initial.cepBase);
  const freteDefault = (initial.freteMotoCents / 100).toFixed(2).replace(".", ",");

  return (
    <form action={action} className="space-y-6">
      {state.ok && (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3.5 py-2.5 text-body-sm text-success">
          <CircleCheck className="size-4 shrink-0" aria-hidden /> Configurações salvas.
        </p>
      )}
      {state.error && !state.fieldErrors && (
        <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3.5 py-2.5 text-body-sm text-danger" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}

      <Field label="CEP Base" htmlFor="cepBase" error={state.fieldErrors?.cepBase} hint="CEP usado como referência da farmácia.">
        <Input
          id="cepBase" name="cepBase" inputMode="numeric" required
          value={cep} onChange={(e) => setCep(maskCEP(e.target.value))}
          invalid={!!state.fieldErrors?.cepBase}
        />
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="raioKm" className="text-label text-foreground">Raio de atendimento</label>
          <span className="rounded-pill bg-soft-pink px-2.5 py-0.5 text-body-sm font-semibold text-primary-pressed">{raio} km</span>
        </div>
        <input
          id="raioKm" name="raioKm" type="range" min={1} max={50} step={1}
          value={raio}
          onChange={(e) => setRaio(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-caption text-muted-foreground">
          <span>1 km</span><span>50 km</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors duration-150 hover:bg-muted",
          "has-[:checked]:border-primary has-[:checked]:bg-soft-pink/60"
        )}>
          <input type="checkbox" name="aceitaRetirada" defaultChecked={initial.aceitaRetirada} className="mt-1 size-4 accent-primary" />
          <div>
            <p className="flex items-center gap-1.5 text-body font-medium"><Store className="size-4 text-muted-foreground" aria-hidden /> Aceita retirada na loja</p>
            <p className="text-body-sm text-muted-foreground">Cliente retira o pedido em até 30 min.</p>
          </div>
        </label>
        <label className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors duration-150 hover:bg-muted",
          "has-[:checked]:border-primary has-[:checked]:bg-soft-pink/60"
        )}>
          <input type="checkbox" name="aceitaMoto" defaultChecked={initial.aceitaMoto} className="mt-1 size-4 accent-primary" />
          <div>
            <p className="flex items-center gap-1.5 text-body font-medium"><Bike className="size-4 text-muted-foreground" aria-hidden /> Aceita moto entrega</p>
            <p className="text-body-sm text-muted-foreground">De 30 min a 2 h, conforme distância.</p>
          </div>
        </label>
      </div>

      <Field label="Frete moto (R$)" htmlFor="freteMoto" error={state.fieldErrors?.freteMoto} hint="Valor cobrado pela moto entrega.">
        <Input id="freteMoto" name="freteMoto" inputMode="decimal" defaultValue={freteDefault} invalid={!!state.fieldErrors?.freteMoto} />
      </Field>

      <Button type="submit" loading={pending}>{pending ? "Salvando…" : "Salvar configurações"}</Button>
    </form>
  );
}
