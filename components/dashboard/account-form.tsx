"use client";
import { useActionState } from "react";
import { CircleCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { updateAccountAction, type SettingsState } from "@/actions/settings";

export function AccountForm({ initial }: { initial: { razaoSocial: string; nomeFantasia: string; email: string } }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateAccountAction, { ok: false });
  return (
    <form action={action} className="space-y-4">
      {state.ok && (
        <p className="flex items-center gap-2 rounded-lg bg-success/10 px-3.5 py-2.5 text-body-sm text-success">
          <CircleCheck className="size-4 shrink-0" aria-hidden /> Conta atualizada.
        </p>
      )}
      {state.error && !state.fieldErrors && (
        <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3.5 py-2.5 text-body-sm text-danger" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      <Field label="Razão Social" htmlFor="razaoSocial" error={state.fieldErrors?.razaoSocial}>
        <Input id="razaoSocial" name="razaoSocial" required defaultValue={initial.razaoSocial} invalid={!!state.fieldErrors?.razaoSocial} />
      </Field>
      <Field label="Nome Fantasia" htmlFor="nomeFantasia" error={state.fieldErrors?.nomeFantasia}>
        <Input id="nomeFantasia" name="nomeFantasia" required defaultValue={initial.nomeFantasia} invalid={!!state.fieldErrors?.nomeFantasia} />
      </Field>
      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" required defaultValue={initial.email} invalid={!!state.fieldErrors?.email} />
      </Field>
      <Button type="submit" loading={pending}>{pending ? "Salvando…" : "Salvar alterações"}</Button>
    </form>
  );
}
