// Idempotent: add settings.shop_name column if it doesn't exist.
//   npx tsx scripts/add-shop-name-column.ts
//   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npx tsx scripts/add-shop-name-column.ts
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
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });

async function main() {
  console.log(`\nTarget: ${url.startsWith("file:") ? "LOCAL" : "PRODUCTION (Turso)"}\n`);

  // Check existing columns
  const info = await client.execute("PRAGMA table_info(settings)");
  const hasCol = info.rows.some((r) => (r as Record<string, unknown>).name === "shop_name");

  if (hasCol) {
    console.log("✓ shop_name column already exists.\n");
  } else {
    await client.execute(
      "ALTER TABLE settings ADD COLUMN shop_name text NOT NULL DEFAULT 'ZoZo'"
    );
    console.log("✓ Added shop_name column (default 'ZoZo').\n");
  }
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
