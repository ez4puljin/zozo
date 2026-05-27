import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "./env";
import * as schema from "@/lib/schema";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Ensure local data/ folder exists when using file:./data/...
if (env.DATABASE_URL.startsWith("file:")) {
  const path = env.DATABASE_URL.replace(/^file:/, "");
  try {
    mkdirSync(dirname(path), { recursive: true });
  } catch {
    // ignore - directory likely exists
  }
}

const client = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
