import "server-only";

function requireSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET must be set (>=32 chars) in production. Run: openssl rand -base64 32"
    );
  }
  return "dev-insecure-secret-please-override-in-env-local-0000";
}

export const env = {
  secret: requireSecret(),
  isProd: process.env.NODE_ENV === "production",
} as const;