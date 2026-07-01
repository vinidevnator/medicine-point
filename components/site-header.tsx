"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/busca", label: "Medicamentos" },
  { href: "/busca?cat=respiratorio", label: "Respiratório" },
  { href: "/busca?cat=cardio", label: "Cardiovascular" },
  { href: "/busca?cat=analgesico", label: "Analgésicos" },
];

export function SiteHeader({ showSearch = true }: { showSearch?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : "/busca");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 md:px-6">
        <button
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => {
            const linkPath = l.href.split("?")[0];
            const active = !l.href.includes("?") && pathname === linkPath;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-body-sm font-medium transition-colors duration-150",
                  active ? "text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {showSearch && (
          <form onSubmit={submitSearch} className="hidden max-w-md flex-1 md:flex" role="search">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                placeholder="Buscar por nome ou EAN…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar medicamentos"
                className="pl-11"
              />
            </div>
          </form>
        )}

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/entrar">
            <Button variant="secondary" size="sm">Sou Farmácia</Button>
          </Link>
          <Link href="/cadastrar">
            <Button size="sm">Cadastrar</Button>
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Link href="/entrar">
            <Button size="sm" variant="secondary">Entrar</Button>
          </Link>
        </div>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} title="Navegação">
        {showSearch && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              setOpen(false);
              router.push(q ? `/busca?q=${encodeURIComponent(q)}` : "/busca");
            }}
            className="mb-4"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                placeholder="Buscar medicamentos…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar medicamentos"
                className="pl-11"
              />
            </div>
          </form>
        )}
        <ul className="flex flex-col gap-0.5">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-body font-medium hover:bg-muted"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 border-t border-border pt-2">
            <Link href="/cadastrar" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-body font-medium text-primary hover:bg-muted">
              Cadastrar farmácia
            </Link>
          </li>
        </ul>
      </Drawer>
    </header>
  );
}
