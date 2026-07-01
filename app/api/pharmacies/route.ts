import { NextResponse } from "next/server";
import { searchService } from "@/services/search.service";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const ean = (searchParams.get("ean") ?? "").replace(/\D/g, "");
  const cep = (searchParams.get("cep") ?? "").replace(/\D/g, "");
  if (ean.length !== 13 || cep.length !== 8) {
    return NextResponse.json(
      { error: "EAN (13 dígitos) e CEP (8 dígitos) são obrigatórios." },
      { status: 400 }
    );
  }
  const formatted = `${cep.slice(0, 5)}-${cep.slice(5)}`;
  const offerings = searchService.findByEanAndCep(ean, formatted);
  return NextResponse.json({ offerings });
}