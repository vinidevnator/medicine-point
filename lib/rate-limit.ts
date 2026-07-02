import "server-only";

type Bucket = { tokens: number; updatedAt: number };

// In-memory, per-process token buckets. On serverless each instance keeps its
// own buckets, so limits are best-effort there; swap for a shared store
// (e.g. Redis/Upstash) if strict global limits are required.
const buckets = new Map<string, Bucket>();

export type RateLimitOptions = { limit: number; windowMs: number };
export type RateLimitResult = { ok: boolean; retryAfterMs: number };

function prune(now: number): void {
  // Keep memory bounded: drop fully-refilled (idle) buckets once the map grows.
  if (buckets.size < 5000) return;
  for (const [key, bucket] of buckets) {
    if (now - bucket.updatedAt > 60 * 60 * 1000) buckets.delete(key);
  }
}

/** Consumes one token for `key`. Returns `ok: false` with a retry hint when empty. */
export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  prune(now);
  const refillPerMs = opts.limit / opts.windowMs;
  const bucket = buckets.get(key) ?? { tokens: opts.limit, updatedAt: now };
  const elapsed = now - bucket.updatedAt;
  bucket.tokens = Math.min(opts.limit, bucket.tokens + elapsed * refillPerMs);
  bucket.updatedAt = now;

  if (bucket.tokens < 1) {
    buckets.set(key, bucket);
    return { ok: false, retryAfterMs: Math.ceil((1 - bucket.tokens) / refillPerMs) };
  }
  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return { ok: true, retryAfterMs: 0 };
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
