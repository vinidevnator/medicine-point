import { NextResponse } from "next/server";
import { fetchCep } from "@/services/cep.service";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const cep = (searchParams.get("cep") ?? "").replace(/\D/g, "");
  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }
  const formatted = `${cep.slice(0, 5)}-${cep.slice(5)}`;
  const address = await fetchCep(formatted);
  return NextResponse.json(address);
}