export type CepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
  uf: string;
};

const FALLBACK_ADDRESS: CepAddress = {
  cep: "",
  logradouro: "",
  bairro: "",
  cidade: "São Paulo",
  estado: "São Paulo",
  uf: "SP",
};

export async function fetchCep(cep: string): Promise<CepAddress> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return FALLBACK_ADDRESS;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!res.ok) return FALLBACK_ADDRESS;
    const json = (await res.json()) as {
      logradouro?: string;
      bairro?: string;
      localidade?: string;
      uf?: string;
      cep?: string;
      erro?: boolean;
    };
    if (json.erro) return FALLBACK_ADDRESS;
    return {
      cep: cep,
      logradouro: json.logradouro ?? "",
      bairro: json.bairro ?? "",
      cidade: json.localidade ?? "",
      estado: estadoName(json.uf ?? ""),
      uf: json.uf ?? "",
    };
  } catch {
    return FALLBACK_ADDRESS;
  }
}

function estadoName(uf: string): string {
  const map: Record<string, string> = {
    SP: "São Paulo", RJ: "Rio de Janeiro", MG: "Minas Gerais", BA: "Bahia",
    PR: "Paraná", RS: "Rio Grande do Sul", CE: "Ceará", PE: "Pernambuco",
  };
  return map[uf] ?? uf;
}