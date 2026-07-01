"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { maskCEP } from "@/lib/masks";
import { updateSettingsAction, type SettingsState } from "@/actions/settings";
import { useState } from "react";

export function SettingsForm({ initial }: {
  initial: { cepBase: string; raioKm: number; aceitaRetirada: boolean; aceitaMoto: boolean; freteMotoCents: number };
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateSettingsAction, { ok: false });
  const [raio, setRaio] = useState(initial.raioKm);
  const [cep, setCep] = useState(initial.cepBase);
  const freteDefault = (initial.freteMotoCents / 100).toFixed(2).replace(".", ",");

  return (
    <form action={action} className="space-y-6">
      {state.ok && <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">Configurações salvas.</p>}
      {state.error && !state.fieldErrors && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{state.error}</p>
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
          <label htmlFor="raioKm" className="text-sm font-medium">Raio de atendimento</label>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-sm font-semibold text-primary">{raio} km</span>
        </div>
        <input
          id="raioKm" name="raioKm" type="range" min={1} max={50} step={1}
          value={raio}
          onChange={(e) => setRaio(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 km</span><span>50 km</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted">
          <input type="checkbox" name="aceitaRetirada" defaultChecked={initial.aceitaRetirada} className="mt-1 h-4 w-4 accent-[var(--primary)]" />
          <div>
            <p className="font-medium">Aceita retirada na loja</p>
            <p className="text-sm text-muted-foreground">Cliente retira o pedido em até 30 min.</p>
          </div>
        </label>
        <label className="flex items-start gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-muted">
          <input type="checkbox" name="aceitaMoto" defaultChecked={initial.aceitaMoto} className="mt-1 h-4 w-4 accent-[var(--primary)]" />
          <div>
            <p className="font-medium">Aceita moto entrega</p>
            <p className="text-sm text-muted-foreground">De 30 min a 2 h, conforme distância.</p>
          </div>
        </label>
      </div>

      <Field label="Frete moto (R$)" htmlFor="freteMoto" error={state.fieldErrors?.freteMoto} hint="Valor cobrado pela moto entrega.">
        <Input id="freteMoto" name="freteMoto" inputMode="decimal" defaultValue={freteDefault} invalid={!!state.fieldErrors?.freteMoto} />
      </Field>

      <Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar configurações"}</Button>
    </form>
  );
}