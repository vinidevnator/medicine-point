"use client";
import { useActionState } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/field";
import { maskCEP, maskCNPJ } from "@/lib/masks";
import { BR_STATES, REVENUE_OPTIONS } from "@/lib/constants";
import { registerAction, type AuthState } from "@/actions/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(registerAction, { ok: false });
  const [cep, setCep] = useState("");

  function setField(name: string, value: string) {
    const el = document.getElementById(name) as HTMLInputElement | HTMLSelectElement | null;
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
        setField("street", data.logradouro ?? "");
        setField("district", data.bairro ?? "");
        setField("city", data.cidade ?? "");
        setField("state", data.uf ?? "");
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [cep]);

  return (
    <form action={action} className="space-y-5">
      {state.error && !state.fieldErrors && (
        <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3.5 py-2.5 text-body-sm text-danger" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CNPJ" htmlFor="cnpj" error={state.fieldErrors?.cnpj}>
          <Input id="cnpj" name="cnpj" inputMode="numeric" placeholder="00.000.000/0000-00" required invalid={!!state.fieldErrors?.cnpj}
            onChange={(e) => (e.target.value = maskCNPJ(e.target.value))} />
        </Field>
        <Field label="Faturamento médio mensal" htmlFor="revenue" error={state.fieldErrors?.revenue}>
          <Select id="revenue" name="revenue" required defaultValue="" invalid={!!state.fieldErrors?.revenue}>
            <option value="" disabled>Selecione…</option>
            {REVENUE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Razão Social" htmlFor="legalName" error={state.fieldErrors?.legalName}>
        <Input id="legalName" name="legalName" required invalid={!!state.fieldErrors?.legalName} />
      </Field>
      <Field label="Nome Fantasia" htmlFor="tradeName" error={state.fieldErrors?.tradeName}>
        <Input id="tradeName" name="tradeName" required invalid={!!state.fieldErrors?.tradeName} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
          <Input id="email" name="email" type="email" autoComplete="email" required invalid={!!state.fieldErrors?.email} />
        </Field>
        <Field label="Senha" htmlFor="password" error={state.fieldErrors?.password} hint="Mínimo 8 caracteres">
          <Input id="password" name="password" type="password" autoComplete="new-password" required invalid={!!state.fieldErrors?.password} />
        </Field>
      </div>

      <Field label="CEP" htmlFor="cep" error={state.fieldErrors?.cep} hint="Preenche o endereço automaticamente">
        <Input id="cep" name="cep" inputMode="numeric" placeholder="00000-000" required invalid={!!state.fieldErrors?.cep}
          value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} />
      </Field>

      <Field label="Endereço" htmlFor="street" error={state.fieldErrors?.street}>
        <Input id="street" name="street" required invalid={!!state.fieldErrors?.street} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Número" htmlFor="number" error={state.fieldErrors?.number}>
          <Input id="number" name="number" required invalid={!!state.fieldErrors?.number} />
        </Field>
        <Field label="Complemento" htmlFor="complement">
          <Input id="complement" name="complement" />
        </Field>
        <Field label="Bairro" htmlFor="district" error={state.fieldErrors?.district}>
          <Input id="district" name="district" required invalid={!!state.fieldErrors?.district} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cidade" htmlFor="city" error={state.fieldErrors?.city}>
          <Input id="city" name="city" required invalid={!!state.fieldErrors?.city} />
        </Field>
        <Field label="Estado (UF)" htmlFor="state" error={state.fieldErrors?.state}>
          <Select id="state" name="state" required defaultValue="" invalid={!!state.fieldErrors?.state}>
            <option value="" disabled>Selecione…</option>
            {BR_STATES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={pending}>
        {pending ? "Cadastrando…" : "Cadastrar e entrar"}
      </Button>
      <p className="text-center text-body-sm text-muted-foreground">
        Já tem conta? <Link href="/login" className="font-medium text-primary hover:underline">Entrar</Link>
      </p>
    </form>
  );
}
