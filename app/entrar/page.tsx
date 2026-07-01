import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <aside className="relative hidden bg-gradient-to-br from-primary to-secondary p-12 text-primary-foreground md:flex md:flex-col md:justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">+</span>
          Medicine Point
        </Link>
        <div>
          <h1 className="text-4xl font-bold leading-tight">Painel da Farmácia</h1>
          <p className="mt-3 max-w-sm opacity-90">
            Gerencie produtos, pedidos e configurações de entrega do seu ponto de coleta.
          </p>
        </div>
        <p className="text-xs opacity-70">© {new Date().getFullYear()} Medicine Point</p>
      </aside>
      <div className="flex flex-col px-6 py-10 md:items-center md:justify-center">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <Link href="/" className="font-bold text-primary">Medicine Point</Link>
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold">Entrar</h2>
          <p className="mt-1 text-sm text-muted-foreground">Acesse o painel da sua farmácia.</p>
          <div className="mt-6"><LoginForm /></div>
        </div>
      </div>
    </div>
  );
}