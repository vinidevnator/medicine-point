const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(cents: number): string {
  return BRL.format(cents / 100);
}

export function parseBRLToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const reais = Number(cleaned);
  if (!Number.isFinite(reais)) return 0;
  return Math.round(reais * 100);
}

export function formatDateTime(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Parses a `YYYY-MM-DD` (native `<input type="date">`) value into a unix-seconds timestamp, or `null` if invalid. */
export function parseDateInputToUnix(value: string): number | null {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / 1000);
}

// Brazil (America/Sao_Paulo) has no DST since 2019, so a fixed UTC-3 offset is
// safe. Timestamps are stored as UTC unix seconds; computing day boundaries in a
// fixed zone (instead of the server's local zone) avoids off-by-one drift near
// midnight when the server runs in a different timezone.
const BRT_OFFSET_MS = -3 * 60 * 60 * 1000;

/** Start-of-day (00:00 BRT) for the given instant, as UTC unix seconds. */
export function startOfDayUnix(date: Date = new Date()): number {
  const wall = new Date(date.getTime() + BRT_OFFSET_MS);
  wall.setUTCHours(0, 0, 0, 0);
  return Math.floor((wall.getTime() - BRT_OFFSET_MS) / 1000);
}

/** Start-of-month (00:00 BRT on the 1st) for the given instant, as UTC unix seconds. */
export function startOfMonthUnix(date: Date = new Date()): number {
  const wall = new Date(date.getTime() + BRT_OFFSET_MS);
  wall.setUTCDate(1);
  wall.setUTCHours(0, 0, 0, 0);
  return Math.floor((wall.getTime() - BRT_OFFSET_MS) / 1000);
}

export function timeLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}