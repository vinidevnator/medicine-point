import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PersonaProvider } from "@/components/persona-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </PersonaProvider>
  );
}
