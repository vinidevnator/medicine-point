"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { maskEAN } from "@/lib/masks";
import { createProductAction, updateProductAction, type ProductState } from "@/actions/products";

type Mode = "create" | "edit";
type Initial = {
  id?: string;
  ean?: string;
  nome?: string;
  descricao?: string;
  precoCents?: number;
  quantidade?: number;
  imagePath?: string;
};

export function ProductForm({ mode, initial }: { mode: Mode; initial?: Initial }) {
  const action = mode === "create" ? createProductAction : updateProductAction;
  const [state, formAction, pending] = useActionState<ProductState, FormData>(action, { ok: false });
  const cents = initial?.precoCents;
  const precoDefaultValue = cents !== undefined ? (cents / 100).toFixed(2).replace(".", ",") : "";

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && !state.fieldErrors && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{state.error}</p>
      )}
      <Field label="EAN (13 dígitos)" htmlFor="ean" error={state.fieldErrors?.ean}>
        <Input
          id="ean" name="ean" inputMode="numeric" required
          defaultValue={initial?.ean ?? ""}
          onChange={(e) => (e.target.value = maskEAN(e.target.value))}
          invalid={!!state.fieldErrors?.ean}
        />
      </Field>
      <Field label="Nome" htmlFor="nome" error={state.fieldErrors?.nome}>
        <Input id="nome" name="nome" required defaultValue={initial?.nome ?? ""} invalid={!!state.fieldErrors?.nome} />
      </Field>
      <Field label="Descrição" htmlFor="descricao" error={state.fieldErrors?.descricao}>
        <textarea
          id="descricao" name="descricao" required rows={3}
          defaultValue={initial?.descricao ?? ""}
          className="w-full rounded-lg border border-input bg-card p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40"
          aria-invalid={!!state.fieldErrors?.descricao}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preço (R$)" htmlFor="preco" error={state.fieldErrors?.preco} hint="Ex.: 39,90">
          <Input id="preco" name="preco" inputMode="decimal" required defaultValue={precoDefaultValue} invalid={!!state.fieldErrors?.preco} />
        </Field>
        <Field label="Quantidade" htmlFor="quantidade" error={state.fieldErrors?.quantidade}>
          <Input id="quantidade" name="quantidade" type="number" min={0} required defaultValue={initial?.quantidade ?? 0} invalid={!!state.fieldErrors?.quantidade} />
        </Field>
      </div>
      <Field label="Imagem (URL)" htmlFor="imagePath" hint="Opcional. Usamos um SVG gerado por padrão.">
        <Input id="imagePath" name="imagePath" defaultValue={initial?.imagePath ?? ""} placeholder="/img/med-generico.svg" />
      </Field>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando…" : mode === "create" ? "Cadastrar produto" : "Salvar alterações"}
      </Button>
    </form>
  );
}