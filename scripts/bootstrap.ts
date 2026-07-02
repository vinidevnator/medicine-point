import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import "../db/seed";

function ensureSecret(): void {
  // On Vercel a .env.local written at build time never reaches the runtime
  // functions; the secret must be configured as a project environment variable.
  if (process.env.VERCEL) {
    if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
      console.error(
        "[bootstrap] AUTH_SECRET (>=32 chars) must be set in the Vercel project environment variables."
      );
      process.exit(1);
    }
    return;
  }

  const envPath = resolve(process.cwd(), ".env.local");
  let existing = "";
  if (existsSync(envPath)) existing = readFileSync(envPath, "utf8");
  if (!existing.includes("AUTH_SECRET=")) {
    const secret = randomBytes(32).toString("base64");
    const prefix = existing && !existing.endsWith("\n") ? "\n" : "";
    writeFileSync(envPath, `${existing}${prefix}AUTH_SECRET=${secret}\n`);
    process.env.AUTH_SECRET = secret;
    console.log("[bootstrap] AUTH_SECRET gravado em .env.local");
  }
}

ensureSecret();
