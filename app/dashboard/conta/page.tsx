import { requirePharmacy } from "@/services/auth-guard.service";
import { pharmacyRepo } from "@/repositories";
import { Card } from "@/components/ui/card";
import { AccountForm } from "@/components/dashboard/account-form";

export default async function ContaPage() {
  const session = await requirePharmacy();
  const ph = pharmacyRepo.get(session.pharmacyId);
  if (!ph) return <Card>Farmácia não encontrada.</Card>;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Minha Conta</h1>
        <p className="text-sm text-muted-foreground">Atualize os dados da sua farmácia.</p>
      </div>
      <Card>
        <AccountForm initial={{ razaoSocial: ph.razaoSocial, nomeFantasia: ph.nomeFantasia, email: ph.email }} />
      </Card>
      <Card>
        <h2 className="font-semibold">Dados cadastrais</h2>
        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-muted-foreground">CNPJ</dt><dd>{ph.cnpj}</dd>
          <dt className="text-muted-foreground">CEP</dt><dd>{ph.cep}</dd>
          <dt className="text-muted-foreground">Endereço</dt><dd>{ph.logradouro}, {ph.numero}</dd>
          <dt className="text-muted-foreground">Cidade/UF</dt><dd>{ph.cidade} / {ph.estado}</dd>
        </dl>
      </Card>
    </div>
  );
}