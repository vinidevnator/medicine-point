import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// Local dev falls back to a file-based database; production (Vercel) must point
// at a remote Turso database because the serverless filesystem is ephemeral.
const url = process.env.TURSO_DATABASE_URL ?? "file:cpv.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!process.env.TURSO_DATABASE_URL && process.env.VERCEL) {
  throw new Error(
    "TURSO_DATABASE_URL must be set on Vercel: a file-based SQLite database does not persist on serverless."
  );
}

const client = createClient({ url, authToken });

// Remote Turso (sqld) enforces foreign keys by default; the local file driver
// follows SQLite's default (off), so enable it explicitly.
if (url.startsWith("file:")) {
  void client.execute("PRAGMA foreign_keys = ON");
}

export const db = drizzle({ client, schema });
export { schema };
