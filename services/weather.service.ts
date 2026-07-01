import "server-only";

export type WeatherSnapshot = {
  cidade: string;
  condicao: string;
  temperaturaC: number | null;
  precipitacaoMm: number | null;
  ventoKmh: number | null;
  chuvaForte: boolean;
};

const FALLBACK: Omit<WeatherSnapshot, "cidade"> = {
  condicao: "indisponível",
  temperaturaC: null,
  precipitacaoMm: null,
  ventoKmh: null,
  chuvaForte: false,
};

// WMO weather codes (used by Open-Meteo) mapped to short pt-BR labels.
// Codes >= 63 with meaningful precipitation are treated as a risk factor for moto delivery.
const WMO_LABELS: Record<number, { label: string; chuvaForte: boolean }> = {
  0: { label: "céu limpo", chuvaForte: false },
  1: { label: "poucas nuvens", chuvaForte: false },
  2: { label: "parcialmente nublado", chuvaForte: false },
  3: { label: "nublado", chuvaForte: false },
  45: { label: "neblina", chuvaForte: false },
  48: { label: "neblina com geada", chuvaForte: false },
  51: { label: "garoa fraca", chuvaForte: false },
  53: { label: "garoa moderada", chuvaForte: false },
  55: { label: "garoa forte", chuvaForte: true },
  56: { label: "garoa congelante fraca", chuvaForte: false },
  57: { label: "garoa congelante forte", chuvaForte: true },
  61: { label: "chuva fraca", chuvaForte: false },
  63: { label: "chuva moderada", chuvaForte: true },
  65: { label: "chuva forte", chuvaForte: true },
  66: { label: "chuva congelante fraca", chuvaForte: false },
  67: { label: "chuva congelante forte", chuvaForte: true },
  71: { label: "neve fraca", chuvaForte: false },
  73: { label: "neve moderada", chuvaForte: true },
  75: { label: "neve forte", chuvaForte: true },
  77: { label: "grãos de neve", chuvaForte: false },
  80: { label: "pancadas de chuva fracas", chuvaForte: false },
  81: { label: "pancadas de chuva moderadas", chuvaForte: true },
  82: { label: "pancadas de chuva violentas", chuvaForte: true },
  85: { label: "pancadas de neve fracas", chuvaForte: false },
  86: { label: "pancadas de neve fortes", chuvaForte: true },
  95: { label: "tempestade com trovoadas", chuvaForte: true },
  96: { label: "tempestade com granizo leve", chuvaForte: true },
  99: { label: "tempestade com granizo forte", chuvaForte: true },
};

type GeocodeResult = { latitude: number; longitude: number; admin1?: string; name: string };

async function geocode(cidade: string, estado: string): Promise<GeocodeResult | null> {
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", cidade);
    url.searchParams.set("count", "5");
    url.searchParams.set("language", "pt");
    url.searchParams.set("format", "json");
    url.searchParams.set("country_code", "BR");
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
    if (!res.ok) return null;
    const json = (await res.json()) as { results?: GeocodeResult[] };
    const results = json.results ?? [];
    if (results.length === 0) return null;
    const byEstado = results.find((r) => r.admin1?.toLowerCase() === estado.toLowerCase());
    return byEstado ?? results[0];
  } catch {
    return null;
  }
}

/** Fetches real-time weather conditions for a city, used to weigh moto-delivery risk. */
export const weatherService = {
  async getCurrentWeather(cidade: string, estado: string): Promise<WeatherSnapshot> {
    if (!cidade) return { cidade: "", ...FALLBACK };
    try {
      const place = await geocode(cidade, estado);
      if (!place) return { cidade, ...FALLBACK };

      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(place.latitude));
      url.searchParams.set("longitude", String(place.longitude));
      url.searchParams.set("current", "temperature_2m,precipitation,weather_code,wind_speed_10m");
      url.searchParams.set("timezone", "auto");
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return { cidade, ...FALLBACK };
      const json = (await res.json()) as {
        current?: {
          temperature_2m?: number;
          precipitation?: number;
          weather_code?: number;
          wind_speed_10m?: number;
        };
      };
      const current = json.current;
      if (!current) return { cidade, ...FALLBACK };
      const wmo = WMO_LABELS[current.weather_code ?? -1];
      return {
        cidade,
        condicao: wmo?.label ?? "condição desconhecida",
        temperaturaC: current.temperature_2m ?? null,
        precipitacaoMm: current.precipitation ?? null,
        ventoKmh: current.wind_speed_10m ?? null,
        chuvaForte: wmo?.chuvaForte ?? false,
      };
    } catch {
      return { cidade, ...FALLBACK };
    }
  },
};
