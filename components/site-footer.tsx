import Link from "next/link";
import { Lock, MapPin, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-4 md:px-6">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-body-sm text-muted-foreground">
            Marketplace de medicamentos. Encontre farmácias próximas, retire na loja, receba por motoentrega ou pela Entrega de Parceiro.
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-label text-foreground">Navegação</h3>
          <ul className="space-y-2.5 text-body-sm text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li><Link href="/search" className="hover:text-foreground">Medicamentos</Link></li>
            <li><Link href="/register" className="hover:text-foreground">Cadastrar farmácia</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Sou Farmácia</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-label text-foreground">Confiança</h3>
          <ul className="space-y-2.5 text-body-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Lock className="size-4 text-muted-foreground" aria-hidden /> Pagamento seguro</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" aria-hidden /> Retirada e entrega</li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-muted-foreground" aria-hidden /> Farmácias verificadas</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-caption text-muted-foreground">
        © {new Date().getFullYear()} CPV — Demonstração (dados fictícios).
      </div>
    </footer>
  );
}
