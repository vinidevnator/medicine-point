import "server-only";

function requireSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  // Fail closed in every environment. `scripts/bootstrap.ts` (run by predev/
  // prebuild) writes a random AUTH_SECRET to .env.local, so the normal flow is
  // covered; a missing/weak secret is always a misconfiguration and must never
  // fall back to a committed, publicly-known signing key.
  throw new Error(
    "AUTH_SECRET must be set (>=32 chars). Run: openssl rand -base64 32 and add it to .env.local"
  );
}

export const env = {
  secret: requireSecret(),
  isProd: process.env.NODE_ENV === "production",
} as const;