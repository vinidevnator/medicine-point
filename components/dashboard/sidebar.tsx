"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Pill, Package, TrendingUp, Settings, User, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { Drawer } from "@/components/ui/drawer";
import { Logo } from "@/components/logo";
import { logoutAction } from "@/actions/auth";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Produtos", icon: Pill },
  { href: "/dashboard/orders", label: "Pedidos", icon: Package },
  { href: "/dashboard/reports", label: "Relatórios", icon: TrendingUp },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
  { href: "/dashboard/account", label: "Minha Conta", icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const Nav = (
    <nav className="flex h-full flex-col gap-1 p-3">
      {items.map((it) => {
        const active = pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(it.href));
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={close}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors duration-150",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            {it.label}
          </Link>
        );
      })}
      <form action={logoutAction} className="mt-auto pt-3">
        <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-danger/10 hover:text-danger">
          <LogOut className="size-[18px] shrink-0" aria-hidden /> Sair
        </button>
      </form>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center border-b border-border px-5">
          <Logo />
        </div>
        {Nav}
      </div>

      <div className="md:hidden">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-4">
          <button onClick={() => setOpen(true)} className="inline-flex size-10 items-center justify-center rounded-lg border border-border" aria-label="Abrir menu">
            <Menu className="size-5" aria-hidden />
          </button>
          <Link href="/dashboard"><Logo /></Link>
          <span className="w-10" />
        </div>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="Painel da farmácia">
        {Nav}
      </Drawer>
    </>
  );
}
