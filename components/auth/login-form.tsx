"use client";
import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { loginAction, type AuthState } from "@/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, { ok: false });

  return (
    <form action={action} className="space-y-4">
      {state.error && !state.fieldErrors && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">{state.error}</p>
      )}
      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required invalid={!!state.fieldErrors?.email} />
      </Field>
      <Field label="Senha" htmlFor="senha" error={state.fieldErrors?.senha}>
        <Input id="senha" name="senha" type="password" autoComplete="current-password" required invalid={!!state.fieldErrors?.senha} />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta? <Link href="/cadastrar" className="font-medium text-primary hover:underline">Cadastrar farmácia</Link>
      </p>
      <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
        Demo: <strong>demo@medicinepoint.com.br</strong> / <strong>demo12345</strong>
      </p>
    </form>
  );
}