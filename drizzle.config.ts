import type { Config } from "drizzle-kit";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const dbUrl = process.env.DATABASE_URL || "file:./data/zozo.db";

const isTurso = dbUrl.startsWith("libsql") || dbUrl.startsWith("https://");

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: isTurso ? "turso" : "sqlite",
  dbCredentials: {
    url: dbUrl,
    ...(isTurso ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
  },
  verbose: true,
  strict: true,
} as Config;
