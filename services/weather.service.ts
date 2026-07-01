import "server-only";

export type WeatherSnapshot = {
  city: string;
  condition: string;
  temperatureC: number | null;
  precipitationMm: number | null;
  windKmh: number | null;
  heavyRain: boolean;
};

const FALLBACK: Omit<WeatherSnapshot, "city"> = {
  condition: "indisponível",
  temperatureC: null,
  precipitationMm: null,
  windKmh: null,
  heavyRain: false,
};

// WMO weather codes (used by Open-Meteo) mapped to short pt-BR labels.
// Codes >= 63 with meaningful precipitation are treated as a risk factor for moto delivery.
const WMO_LABELS: Record<number, { label: string; heavyRain: boolean }> = {
  0: { label: "céu limpo", heavyRain: false },
  1: { label: "poucas nuvens", heavyRain: false },
  2: { label: "parcialmente nublado", heavyRain: false },
  3: { label: "nublado", heavyRain: false },
  45: { label: "neblina", heavyRain: false },
  48: { label: "neblina com geada", heavyRain: false },
  51: { label: "garoa fraca", heavyRain: false },
  53: { label: "garoa moderada", heavyRain: false },
  55: { label: "garoa forte", heavyRain: true },
  56: { label: "garoa congelante fraca", heavyRain: false },
  57: { label: "garoa congelante forte", heavyRain: true },
  61: { label: "chuva fraca", heavyRain: false },
  63: { label: "chuva moderada", heavyRain: true },
  65: { label: "chuva forte", heavyRain: true },
  66: { label: "chuva congelante fraca", heavyRain: false },
  67: { label: "chuva congelante forte", heavyRain: true },
  71: { label: "neve fraca", heavyRain: false },
  73: { label: "neve moderada", heavyRain: true },
  75: { label: "neve forte", heavyRain: true },
  77: { label: "grãos de neve", heavyRain: false },
  80: { label: "pancadas de chuva fracas", heavyRain: false },
  81: { label: "pancadas de chuva moderadas", heavyRain: true },
  82: { label: "pancadas de chuva violentas", heavyRain: true },
  85: { label: "pancadas de neve fracas", heavyRain: false },
  86: { label: "pancadas de neve fortes", heavyRain: true },
  95: { label: "tempestade com trovoadas", heavyRain: true },
  96: { label: "tempestade com granizo leve", heavyRain: true },
  99: { label: "tempestade com granizo forte", heavyRain: true },
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
  async getCurrentWeather(city: string, state: string): Promise<WeatherSnapshot> {
    if (!city) return { city: "", ...FALLBACK };
    try {
      const place = await geocode(city, state);
      if (!place) return { city, ...FALLBACK };

      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.set("latitude", String(place.latitude));
      url.searchParams.set("longitude", String(place.longitude));
      url.searchParams.set("current", "temperature_2m,precipitation,weather_code,wind_speed_10m");
      url.searchParams.set("timezone", "auto");
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return { city, ...FALLBACK };
      const json = (await res.json()) as {
        current?: {
          temperature_2m?: number;
          precipitation?: number;
          weather_code?: number;
          wind_speed_10m?: number;
        };
      };
      const current = json.current;
      if (!current) return { city, ...FALLBACK };
      const wmo = WMO_LABELS[current.weather_code ?? -1];
      return {
        city,
        condition: wmo?.label ?? "condição desconhecida",
        temperatureC: current.temperature_2m ?? null,
        precipitationMm: current.precipitation ?? null,
        windKmh: current.wind_speed_10m ?? null,
        heavyRain: wmo?.heavyRain ?? false,
      };
    } catch {
      return { city, ...FALLBACK };
    }
  },
};
