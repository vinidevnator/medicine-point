"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Drawer } from "@/components/ui/drawer";
import { logoutAction } from "@/actions/auth";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/produtos", label: "Produtos", icon: "💊" },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: "📦" },
  { href: "/dashboard/relatorios", label: "Relatórios", icon: "📈" },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: "⚙️" },
  { href: "/dashboard/conta", label: "Minha Conta", icon: "👤" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const Nav = (
    <nav className="flex flex-col gap-1 p-3">
      {items.map((it) => {
        const active = pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(it.href));
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={close}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span aria-hidden>{it.icon}</span>
            {it.label}
          </Link>
        );
      })}
      <form action={logoutAction} className="mt-auto pt-3">
        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-danger/10 hover:text-danger">
          <span aria-hidden>🚪</span> Sair
        </button>
      </form>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-5 font-bold text-primary">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">+</span>
          Medicine Point
        </div>
        {Nav}
      </div>

      <div className="md:hidden">
        <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <button onClick={() => setOpen(true)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border" aria-label="Abrir menu">☰</button>
          <Link href="/dashboard" className="font-bold text-primary">Medicine Point</Link>
          <span className="w-10" />
        </div>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="Painel da farmácia">
        {Nav}
      </Drawer>
    </>
  );
}