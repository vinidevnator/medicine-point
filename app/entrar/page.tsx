import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Entrar" };

export default function EntrarPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-purple p-12 text-white md:flex md:flex-col md:justify-between">
        <Link href="/"><Logo tone="onDark" /></Link>
        <div>
          <h1 className="text-headline text-[36px] font-bold leading-tight text-balance">Painel da Farmácia</h1>
          <p className="mt-3 max-w-sm text-body opacity-90">
            Gerencie produtos, pedidos e configurações de entrega do seu ponto de coleta.
          </p>
        </div>
        <p className="text-caption opacity-70">© {new Date().getFullYear()} Medicine Point</p>
      </aside>
      <div className="flex flex-col px-6 py-10 md:items-center md:justify-center">
        <div className="mb-8 flex items-center justify-between md:hidden">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-[26px] font-bold">Entrar</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">Acesse o painel da sua farmácia.</p>
          <div className="mt-6"><LoginForm /></div>
        </div>
      </div>
    </div>
  );
}
