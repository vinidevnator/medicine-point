"use client";
import { useActionState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/field";
import { maskEAN } from "@/lib/masks";
import { CATEGORIES } from "@/lib/constants";
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
  category?: string;
};

export function ProductForm({ mode, initial, onSuccess }: { mode: Mode; initial?: Initial; onSuccess?: () => void }) {
  const action = mode === "create" ? createProductAction : updateProductAction;
  const [state, formAction, pending] = useActionState<ProductState, FormData>(action, { ok: false });
  const cents = initial?.precoCents;
  const precoDefaultValue = cents !== undefined ? (cents / 100).toFixed(2).replace(".", ",") : "";

  useEffect(() => {
    if (state.ok) onSuccess?.();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {state.error && !state.fieldErrors && (
        <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3.5 py-2.5 text-body-sm text-danger" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.error}
        </p>
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
        <Textarea
          id="descricao" name="descricao" required rows={3}
          defaultValue={initial?.descricao ?? ""}
          invalid={!!state.fieldErrors?.descricao}
        />
      </Field>
      <Field label="Categoria" htmlFor="category" error={state.fieldErrors?.category}>
        <Select
          id="category"
          name="category"
          required
          defaultValue={initial?.category ?? ""}
          invalid={!!state.fieldErrors?.category}
        >
          <option value="" disabled>Selecione uma categoria</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </Select>
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
      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Salvando…" : mode === "create" ? "Cadastrar produto" : "Salvar alterações"}
      </Button>
    </form>
  );
}