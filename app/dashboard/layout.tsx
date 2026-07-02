import { requirePharmacy } from "@/services/auth-guard.service";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pharmacyRepo } from "@/repositories";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requirePharmacy();
  const pharmacy = await pharmacyRepo.get(session.pharmacyId);

  return (
    <div className="flex min-h-svh flex-col bg-background md:flex-row">
      <DashboardSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-card/85 px-6 backdrop-blur md:flex">
          <div>
            <p className="text-caption text-muted-foreground">Olá,</p>
            <p className="-mt-0.5 text-body font-semibold">{pharmacy?.tradeName ?? "Farmácia"}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-body-sm font-medium text-muted-foreground hover:text-foreground">
              Ver site <ArrowRight className="size-3.5" aria-hidden />
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
      <div className="hidden" aria-hidden>{session.userId}</div>
    </div>
  );
}