import "server-only";
import { Agent, run, tool, setDefaultOpenAIKey } from "@openai/agents";
import { z } from "zod";
import { searchService, type PharmacyOffering } from "./search.service";
import { weatherService } from "./weather.service";

export type DeliveryOption = {
  pharmacyId: string;
  nomeFantasia: string;
  tipo: "retirada" | "moto" | "distribuicao";
  precoTotalCents: number;
  tempoEstimadoMin: number;
};

const RecommendationSchema = z.object({
  melhorOpcao: z.enum(["retirada", "moto", "distribuicao"]),
  pharmacyId: z.string(),
  resumo: z.string().describe("Uma frase curta em português (pt-BR) resumindo a recomendação."),
  justificativa: z
    .string()
    .describe("Parágrafo curto em português explicando por que essa opção é a melhor, considerando preço e tempo."),
  climaConsiderado: z
    .string()
    .describe("Explicação breve em português de como o clima atual influenciou (ou não) a recomendação."),
  alertaClima: z.boolean().describe("true se o clima representa um risco real para a moto entrega."),
});

export type DeliveryRecommendation = z.infer<typeof RecommendationSchema>;

export type AdvisorResult =
  | { ok: true; recommendation: DeliveryRecommendation; weather: Awaited<ReturnType<typeof weatherService.getCurrentWeather>> }
  | { ok: false; error: string };

/**
 * Flattens pharmacy offerings into one comparable option per delivery method.
 * `PharmacyOffering.tempoEstimadoMin`/`freteCents` are collapsed to the fastest
 * available method for that pharmacy, so each method's own time/fee is recomputed
 * via `searchService.estimateDelivery` for an accurate side-by-side comparison.
 */
function buildOptions(offerings: PharmacyOffering[]): DeliveryOption[] {
  const options: DeliveryOption[] = [];
  for (const o of offerings) {
    for (const tipo of o.tiposEntrega) {
      const est = searchService.estimateDelivery(tipo, o.distanciaKm);
      const frete = tipo === "moto" ? o.freteCents : 0;
      options.push({
        pharmacyId: o.pharmacyId,
        nomeFantasia: o.nomeFantasia,
        tipo,
        precoTotalCents: o.precoCents + frete,
        tempoEstimadoMin: est.tempoMin,
      });
    }
  }
  return options;
}

const getWeatherTool = tool({
  name: "get_weather",
  description:
    "Retorna as condições climáticas em tempo real de uma cidade brasileira, usadas para avaliar o risco da moto entrega.",
  parameters: z.object({
    cidade: z.string().describe("Nome da cidade a consultar."),
    estado: z.string().describe("Nome do estado (UF por extenso) da cidade."),
  }),
  async execute({ cidade, estado }) {
    const snapshot = await weatherService.getCurrentWeather(cidade, estado);
    return JSON.stringify(snapshot);
  },
});

function buildAgent() {
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";
  return new Agent({
    name: "Delivery Advisor",
    model,
    instructions: `Você é um assistente que ajuda um cliente de farmácia a escolher a melhor forma de receber um medicamento entre três opções: "retirada" (retirada na loja), "moto" (moto entrega) e "distribuicao" (centro de distribuição).

Regras:
1. Você sempre recebe uma lista de opções já calculadas, cada uma com preço total (em centavos) e tempo estimado (em minutos).
2. Antes de decidir, SEMPRE chame a ferramenta get_weather para a cidade e estado informados no prompt, para saber as condições climáticas atuais em tempo real.
3. Priorize principalmente o tempo estimado de entrega/retirada. Preço é um critério secundário para desempatar opções com tempo parecido.
4. Se o clima indicar chuva forte, tempestade ou condição severa (chuvaForte = true), considere que a moto entrega pode atrasar ou ficar arriscada e prefira "retirada" ou "distribuicao" quando o tempo delas for razoável, deixando isso claro na justificativa e em climaConsiderado. Se o clima estiver bom (chuvaForte = false), diga isso brevemente em climaConsiderado.
5. Responda sempre em português do Brasil, em tom calmo e direto, sem alarmismo.
6. O campo pharmacyId da resposta deve ser exatamente o pharmacyId da opção escolhida.`,
    tools: [getWeatherTool],
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

    const prompt = `Cidade do cliente: ${params.cidade} (${params.estado}).

Opções de entrega disponíveis (compare todas antes de decidir):
${options
  .map(
    (o, i) =>
      `${i + 1}. tipo="${o.tipo}" | farmácia="${o.nomeFantasia}" | pharmacyId="${o.pharmacyId}" | preço total=R$ ${(o.precoTotalCents / 100).toFixed(2)} | tempo estimado=${o.tempoEstimadoMin} min`
  )
  .join("\n")}

Consulte o clima atual de ${params.cidade} (${params.estado}) com a ferramenta disponível e então recomende a melhor opção.`;

    try {
      const agent = buildAgent();
      const result = await run(agent, prompt, { maxTurns: 4 });
      const recommendation = result.finalOutput;
      if (!recommendation) {
        return { ok: false, error: "O assistente não retornou uma recomendação válida." };
      }
      const weather = await weatherService.getCurrentWeather(params.cidade, params.estado);
      return { ok: true, recommendation, weather };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Falha ao gerar recomendação.";
      return { ok: false, error: message };
    }
  },
};
