import { RegisterForm } from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cadastrar farmácia" };

export default function CadastrarPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <aside className="relative hidden bg-gradient-to-br from-secondary to-primary p-12 text-primary-foreground md:flex md:flex-col md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">+</span>
          Medicine Point
        </Link>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Vire um ponto de coleta</h1>
          <p className="mt-3 max-w-sm opacity-90">
            Cadastre sua farmácia, configure seu raio de atendimento e use seu estoque para vender medicamentos locais.
          </p>
        </div>
        <p className="text-xs opacity-70">Leva menos de 2 minutos.</p>
      </aside>
      <div className="flex flex-col px-6 py-10">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <Link href="/" className="font-bold text-primary">Medicine Point</Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="text-2xl font-bold">Cadastrar farmácia</h2>
          <p className="mt-1 text-sm text-muted-foreground">Após o cadastro você entra automaticamente.</p>
          <div className="mt-6"><RegisterForm /></div>
        </div>
      </div>
    </div>
  );
}