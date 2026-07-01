import { SP_BBOX } from "./constants";

// Reference coords for a handful of well-known SEED CEPs (formatted as 01310-100).
export const CEP_INFO: Record<string, { lat: number; lng: number }> = {
  "01310-100": { lat: -23.5616, lng: -46.6561 },
  "04547-130": { lat: -23.5985, lng: -46.6821 },
  "05407-002": { lat: -23.5587, lng: -46.692 },
  "01404-100": { lat: -23.5768, lng: -46.6902 },
  "02012-000": { lat: -23.5195, lng: -46.6411 },
  "04101-000": { lat: -23.5845, lng: -46.6352 },
};

const digitsOnly = (s: string): string => s.replace(/\D/g, "");

export function cepToCoords(cep: string): { lat: number; lng: number } {
  const known = CEP_INFO[cep];
  if (known) return known;
  const digits = digitsOnly(cep).padEnd(8, "0");
  // Deterministic pseudo-coordinates inside the São Paulo bounding box.
  let h = 2166136261;
  for (let i = 0; i < digits.length; i++) {
    h ^= digits.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = (h >>> 0) / 0xffffffff;
  const u2 = ((h >> 8) >>> 0) / 0xffffffff;
  const { minLat, maxLat, minLng, maxLng } = SP_BBOX;
  return {
    lat: minLat + u * (maxLat - minLat),
    lng: minLng + u2 * (maxLng - minLng),
  };
}

const EARTH_R = 6371;
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (d: number): number => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(s));
}