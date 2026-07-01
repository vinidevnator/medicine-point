"use client";
import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { loginAction, type AuthState } from "@/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(loginAction, { ok: false });

  return (
    <form action={action} className="space-y-4">
      {state.error && !state.fieldErrors && (
        <p className="flex items-center gap-2 rounded-lg bg-danger/10 px-3.5 py-2.5 text-body-sm text-danger" role="alert">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.error}
        </p>
      )}
      <Field label="E-mail" htmlFor="email" error={state.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required invalid={!!state.fieldErrors?.email} />
      </Field>
      <Field label="Senha" htmlFor="password" error={state.fieldErrors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required invalid={!!state.fieldErrors?.password} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-body-sm text-muted-foreground">
        Não tem conta? <Link href="/register" className="font-medium text-primary hover:underline">Cadastrar farmácia</Link>
      </p>
      <p className="rounded-lg bg-muted px-3.5 py-2.5 text-center text-caption text-muted-foreground">
        Demo: <strong>demo@medicinepoint.com.br</strong> / <strong>demo12345</strong>
      </p>
    </form>
  );
}
