"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
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
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : "/busca");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">+</span>
          Medicine Point
        </Link>

        {showSearch && (
          <form onSubmit={submitSearch} className="hidden flex-1 max-w-xl mx-4 md:flex">
            <Input
              type="search"
              placeholder="Buscar medicamentos por nome ou EAN…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar medicamentos"
            />
            <Button type="submit" className="ml-2">Buscar</Button>
          </form>
        )}

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navLinks.slice(0, 2).map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <ThemeToggle className="ml-1" />
          <Link href="/entrar">
            <Button variant="outline" size="sm">Sou Farmácia</Button>
          </Link>
          <Link href="/cadastrar">
            <Button size="sm">Cadastrar</Button>
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Link href="/entrar">
            <Button size="sm" variant="outline">Entrar</Button>
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
            className="mb-4 flex gap-2"
          >
            <Input
              type="search"
              placeholder="Buscar medicamentos…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar medicamentos"
            />
            <Button type="submit">Buscar</Button>
          </form>
        )}
        <ul className="flex flex-col">
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn("block rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted")}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-2 border-t border-border pt-2">
            <Link href="/cadastrar" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-muted">
              Cadastrar farmácia
            </Link>
          </li>
        </ul>
      </Drawer>
    </header>
  );
}