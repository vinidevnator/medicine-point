import { requirePharmacy } from "@/services/auth-guard.service";
import { pharmacyRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function ConfiguracoesPage() {
  const session = await requirePharmacy();
  const settings = pharmacyRepo.getSettings(session.pharmacyId);

  if (!settings) return <Card>Configuração não encontrada.</Card>;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted-foreground">Defina como sua farmácia atende pedidos locais.</p>
      </div>
      <Card>
        <SettingsForm
          initial={{
            cepBase: settings.cepBase,
            raioKm: settings.raioKm,
            aceitaRetirada: settings.aceitaRetirada,
            aceitaMoto: settings.aceitaMoto,
            freteMotoCents: settings.freteMotoCents,
          }}
        />
      </Card>
    </div>
  );
}