// Idempotent: create the `media` table if it doesn't exist.
// Safe to run against local SQLite AND production Turso (additive only).
//   npx tsx scripts/add-media-table.ts
//   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npx tsx scripts/add-media-table.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const url = process.env.DATABASE_URL || "file:./data/zozo.db";
if (url.startsWith("file:")) {
  mkdirSync(dirname(url.replace(/^file:/, "")), { recursive: true });
}

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  const isProd = !url.startsWith("file:");
  console.log(`\nTarget: ${isProd ? "PRODUCTION (Turso)" : "LOCAL (SQLite)"}\n`);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS media (
      id text PRIMARY KEY NOT NULL,
      mime text NOT NULL,
      data blob NOT NULL,
      size integer NOT NULL,
      created_at integer DEFAULT (unixepoch()) NOT NULL
    );
  `);

  console.log("✓ media table ready.\n");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
