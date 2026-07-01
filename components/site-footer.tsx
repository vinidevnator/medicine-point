import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">+</span>
            Medicine Point
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Marketplace de medicamentos. Encontre farmácias próximas, retire na loja, receba por motoentrega ou pelo centro de distribuição.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Navegação</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li><Link href="/busca" className="hover:text-foreground">Medicamentos</Link></li>
            <li><Link href="/cadastrar" className="hover:text-foreground">Cadastrar farmácia</Link></li>
            <li><Link href="/entrar" className="hover:text-foreground">Sou Farmácia</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Confiança</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>🔒 Pagamento seguro</li>
            <li>📍 Retirada e entrega</li>
            <li>✅ Farmácias verificadas</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Medicine Point — Demonstração (dados fictícios).
      </div>
    </footer>
  );
}