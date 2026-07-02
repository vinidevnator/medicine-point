import type { Metadata } from "next";
import { requirePharmacy } from "@/services/auth-guard.service";
import { pharmacyRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const session = await requirePharmacy();
  const settings = await pharmacyRepo.getSettings(session.pharmacyId);

  if (!settings) return <Card>Configuração não encontrada.</Card>;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-[26px] font-bold">Configurações</h1>
        <p className="text-body-sm text-muted-foreground">Defina como sua farmácia atende pedidos locais.</p>
      </div>
      <Card>
        <SettingsForm
          initial={{
            baseCep: settings.baseCep,
            radiusKm: settings.radiusKm,
            acceptsPickup: settings.acceptsPickup,
            acceptsMoto: settings.acceptsMoto,
            motoShippingCents: settings.motoShippingCents,
          }}
        />
      </Card>
    </div>
  );
}