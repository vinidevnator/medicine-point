import "server-only";
import { Agent, run, setDefaultOpenAIKey } from "@openai/agents";
import { z } from "zod";
import { searchService, type PharmacyOffering } from "./search.service";
import { weatherService, type WeatherSnapshot } from "./weather.service";

export type DeliveryOption = {
  pharmacyId: string;
  tradeName: string;
  type: "pickup" | "moto" | "distribution";
  totalPriceCents: number;
  estimatedTimeMin: number;
};

const RecommendationSchema = z.object({
  bestOption: z.enum(["pickup", "moto", "distribution"]),
  pharmacyId: z.string(),
  summary: z.string().describe("Uma frase curta em português (pt-BR) resumindo a recomendação."),
  rationale: z
    .string()
    .describe("Parágrafo curto em português explicando por que essa opção é a melhor, considerando preço e tempo."),
  weatherConsidered: z
    .string()
    .describe("Explicação breve em português de como o clima atual influenciou (ou não) a recomendação."),
  weatherAlert: z.boolean().describe("true se o clima representa um risco real para a moto entrega."),
});

export type DeliveryRecommendation = z.infer<typeof RecommendationSchema>;

export type AdvisorResult =
  | { ok: true; recommendation: DeliveryRecommendation; weather: Awaited<ReturnType<typeof weatherService.getCurrentWeather>> }
  | { ok: false; error: string };

/**
 * Flattens pharmacy offerings into one comparable option per delivery method.
 * `PharmacyOffering.estimatedTimeMin`/`shippingCents` are collapsed to the fastest
 * available method for that pharmacy, so each method's own time/fee is recomputed
 * via `searchService.estimateDelivery` for an accurate side-by-side comparison.
 */
function buildOptions(offerings: PharmacyOffering[]): DeliveryOption[] {
  const options: DeliveryOption[] = [];
  for (const o of offerings) {
    for (const type of o.deliveryTypes) {
      const est = searchService.estimateDelivery(type, o.distanceKm);
      const shipping = type === "moto" ? o.shippingCents : 0;
      options.push({
        pharmacyId: o.pharmacyId,
        tradeName: o.tradeName,
        type,
        totalPriceCents: o.priceCents + shipping,
        estimatedTimeMin: est.timeMin,
      });
    }
  }
  return options;
}

function buildAgent() {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  return new Agent({
    name: "Delivery Advisor",
    model,
    instructions: `Você é um assistente que ajuda um cliente de farmácia a escolher a melhor forma de receber um medicamento entre três opções: "pickup" (retirada na loja), "moto" (moto entrega) e "distribution" (centro de distribuição).

Regras:
1. Você sempre recebe uma lista de opções já calculadas, cada uma com preço total (em centavos) e tempo estimado (em minutos).
2. As condições climáticas atuais em tempo real já são fornecidas no prompt (incluindo o campo heavyRain); use-as diretamente, não há ferramenta a chamar.
3. Priorize principalmente o tempo estimado de entrega/retirada. Preço é um critério secundário para desempatar opções com tempo parecido.
4. Se o clima indicar chuva forte, tempestade ou condição severa (heavyRain = true), considere que a moto entrega pode atrasar ou ficar arriscada e prefira "pickup" ou "distribution" quando o tempo delas for razoável, deixando isso claro em rationale e em weatherConsidered. Se o clima estiver bom (heavyRain = false), diga isso brevemente em weatherConsidered.
5. Responda sempre em português do Brasil, em tom calmo e direto, sem alarmismo.
6. O campo pharmacyId da resposta deve ser exatamente o pharmacyId da opção escolhida.
7. O campo bestOption deve ser exatamente "pickup", "moto" ou "distribution".`,
    outputType: RecommendationSchema,
  });
}

export const deliveryAdvisorService = {
  async recommend(params: {
    offerings: PharmacyOffering[];
    cidade: string;
    estado: string;
  }): Promise<AdvisorResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "OPENAI_API_KEY não configurada." };
    }
    const options = buildOptions(params.offerings);
    if (options.length === 0) {
      return { ok: false, error: "Nenhuma opção de entrega disponível para análise." };
    }

    setDefaultOpenAIKey(apiKey);

    // Fetch the weather once and feed it into the prompt, so the model reasons
    // over the exact same snapshot we return to the client.
    const weather: WeatherSnapshot = await weatherService.getCurrentWeather(params.cidade, params.estado);

    const prompt = `Cidade do cliente: ${params.cidade} (${params.estado}).

Clima atual (em tempo real): ${JSON.stringify(weather)}

Opções de entrega disponíveis (compare todas antes de decidir):
${options
  .map(
    (o, i) =>
      `${i + 1}. type="${o.type}" | farmácia="${o.tradeName}" | pharmacyId="${o.pharmacyId}" | preço total=R$ ${(o.totalPriceCents / 100).toFixed(2)} | tempo estimado=${o.estimatedTimeMin} min`
  )
  .join("\n")}

Considerando o clima acima, recomende a melhor opção.`;

    try {
      const agent = buildAgent();
      const result = await run(agent, prompt, { maxTurns: 4 });
      const recommendation = result.finalOutput;
      if (!recommendation) {
        return { ok: false, error: "Não foi possível gerar a recomendação." };
      }
      return { ok: true, recommendation, weather };
    } catch (err) {
      // Log the detailed upstream error server-side; never leak it to the client.
      console.error("[delivery-advisor] recommendation failed:", err);
      return { ok: false, error: "Não foi possível gerar a recomendação." };
    }
  },
};
