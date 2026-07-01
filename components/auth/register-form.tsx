"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { maskCEP, maskCNPJ } from "@/lib/masks";
import { FATURAMENTO_OPCOES } from "@/lib/constants";
import { registerAction, type AuthState } from "@/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, { ok: false });
  const [cep, setCep] = useState("");

  function setField(name: string, value: string) {
    const el = document.getElementById(name) as HTMLInputElement | null;
    if (el) el.value = value;
  }

  useEffect(() => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    const ctrl = new AbortController();
    fetch(`/api/cep?cep=${clean}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.erro) return;
        setField("logradouro", data.logradouro ?? "");
        setField("bairro", data.bairro ?? "");
        setField("cidade", data.cidade ?? "");
        setField("estado", data.uf ?? "");
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [cep]);

  return (
    <form action={action} className="space-y-5">
      {state.error && !state.fieldErrors && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{state.error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CNPJ" htmlFor="cnpj" error={state.fieldErrors?.cnpj}>
          <Input id="cnpj" name="cnpj" inputMode="numeric" placeholder="00.000.000/0000-00" required invalid={!!state.fieldErrors?.cnpj}
            onChange={(e) => (e.target.value = maskCNPJ(e.target.value))} />
        </Field>
        <Field label="Faturamento médio mensal" htmlFor="faturamento" error={state.fieldErrors?.faturamento}>
          <select id="faturamento" name="faturamento" required
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40">
            <option value="">Selecione…</option>
            {FATURAMENTO_OPCOES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Razão Social" htmlFor="razaoSocial" error={state.fieldErrors?.razaoSocial}>
        <Input id="razaoSocial" name="razaoSocial" required invalid={!!state.fieldErrors?.razaoSocial} />
      </Field>
      <Field label="Nome Fantasia" htmlFor="nomeFantasia" error={state.fieldErrors?.nomeFantasia}>
        <Input id="nomeFantasia" name="nomeFantasia" required invalid={!!state.fieldErrors?.nomeFantasia} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required invalid={!!state.fieldErrors?.email} />
        </Field>
        <Field label="Senha" htmlFor="senha" error={state.fieldErrors?.senha} hint="Mínimo 8 caracteres">
          <Input id="senha" name="senha" type="password" autoComplete="new-password" required invalid={!!state.fieldErrors?.senha} />
        </Field>
      </div>

      <Field label="CEP" htmlFor="cep" error={state.fieldErrors?.cep} hint="Preenche o endereço automaticamente">
        <Input id="cep" name="cep" inputMode="numeric" placeholder="00000-000" required invalid={!!state.fieldErrors?.cep}
          value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} />
      </Field>

      <Field label="Endereço" htmlFor="logradouro" error={state.fieldErrors?.logradouro}>
        <Input id="logradouro" name="logradouro" required invalid={!!state.fieldErrors?.logradouro} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Número" htmlFor="numero" error={state.fieldErrors?.numero}>
          <Input id="numero" name="numero" required invalid={!!state.fieldErrors?.numero} />
        </Field>
        <Field label="Complemento" htmlFor="complemento">
          <Input id="complemento" name="complemento" />
        </Field>
        <Field label="Bairro" htmlFor="bairro" error={state.fieldErrors?.bairro}>
          <Input id="bairro" name="bairro" required invalid={!!state.fieldErrors?.bairro} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cidade" htmlFor="cidade" error={state.fieldErrors?.cidade}>
          <Input id="cidade" name="cidade" required invalid={!!state.fieldErrors?.cidade} />
        </Field>
        <Field label="Estado (UF)" htmlFor="estado" error={state.fieldErrors?.estado}>
          <Input id="estado" name="estado" maxLength={2} required invalid={!!state.fieldErrors?.estado} />
        </Field>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Cadastrando…" : "Cadastrar e entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta? <Link href="/entrar" className="font-medium text-primary hover:underline">Entrar</Link>
      </p>
    </form>
  );
}