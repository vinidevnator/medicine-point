import { NextResponse } from "next/server";
import { searchService } from "@/services/search.service";
import { fetchCep } from "@/services/cep.service";
import { deliveryAdvisorService } from "@/services/delivery-advisor.service";

export async function POST(request: Request): Promise<Response> {
  let body: { ean?: unknown; cep?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const ean = String(body.ean ?? "").replace(/\D/g, "");
  const cep = String(body.cep ?? "").replace(/\D/g, "");
  if (ean.length !== 13 || cep.length !== 8) {
    return NextResponse.json(
      { error: "EAN (13 dígitos) e CEP (8 dígitos) são obrigatórios." },
      { status: 400 }
    );
  }

  const formattedCep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
  // Offerings and address are always recomputed server-side (never trusted from the client)
  // so the recommendation can't be manipulated via a tampered request body.
  const offerings = searchService.findByEanAndCep(ean, formattedCep);
  if (offerings.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma opção de entrega encontrada para este CEP." },
      { status: 404 }
    );
  }
  const address = await fetchCep(formattedCep);

  const result = await deliveryAdvisorService.recommend({
    offerings,
    cidade: address.cidade,
    estado: address.estado,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ recommendation: result.recommendation, weather: result.weather });
}
