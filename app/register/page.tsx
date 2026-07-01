import { RegisterForm } from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cadastrar farmácia" };

export default function CadastrarPage() {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-purple to-primary p-12 text-white md:flex md:flex-col md:justify-between">
        <Link href="/"><Logo tone="onDark" /></Link>
        <div>
          <h1 className="text-headline text-[36px] font-bold leading-tight text-balance">Vire um ponto de coleta</h1>
          <p className="mt-3 max-w-sm text-body opacity-90">
            Cadastre sua farmácia, configure seu raio de atendimento e use seu estoque para vender medicamentos locais.
          </p>
        </div>
        <p className="text-caption opacity-70">Leva menos de 2 minutos.</p>
      </aside>
      <div className="flex flex-col px-6 py-10">
        <div className="mb-8 flex items-center justify-between md:hidden">
          <Link href="/"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="mx-auto w-full max-w-2xl">
          <h2 className="text-[26px] font-bold">Cadastrar farmácia</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">Após o cadastro você entra automaticamente.</p>
          <div className="mt-6"><RegisterForm /></div>
        </div>
      </div>
    </div>
  );
}
