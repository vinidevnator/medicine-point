import { NextResponse } from "next/server";
import { searchService } from "@/services/search.service";
import { fetchCep } from "@/services/cep.service";
import { deliveryAdvisorService } from "@/services/delivery-advisor.service";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// This endpoint drives paid OpenAI calls. It is public (anonymous checkout), so
// it must be throttled and cached to prevent cost-amplification abuse.
const RATE_LIMIT = { limit: 20, windowMs: 60 * 60 * 1000 }; // 20 requests/hour/IP
const CACHE_TTL_MS = 10 * 60 * 1000; // recommendation is deterministic per city

type CachedResult = {
  expiresAt: number;
  payload: { recommendation: unknown; weather: unknown };
};
const cache = new Map<string, CachedResult>();

export async function POST(request: Request): Promise<Response> {
  const ip = clientIp(request.headers);
  const limited = rateLimit(`advisor:${ip}`, RATE_LIMIT);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Muitas solicitações. Tente novamente em instantes." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limited.retryAfterMs / 1000)) } }
    );
  }

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

  const cacheKey = `${ean}:${cep}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.payload);
  }

  const formattedCep = `${cep.slice(0, 5)}-${cep.slice(5)}`;
  // Offerings and address are always recomputed server-side (never trusted from the client)
  // so the recommendation can't be manipulated via a tampered request body.
  const offerings = await searchService.findByEanAndCep(ean, formattedCep);
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
  const payload = { recommendation: result.recommendation, weather: result.weather };
  cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
  return NextResponse.json(payload);
}
