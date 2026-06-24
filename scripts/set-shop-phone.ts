// Set the shop contact phone in settings (singleton row id=1).
//   npx tsx scripts/set-shop-phone.ts
//   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npx tsx scripts/set-shop-phone.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const PHONE = "86058979";
const url = process.env.DATABASE_URL || "file:./data/zozo.db";
if (url.startsWith("file:")) {
  mkdirSync(dirname(url.replace(/^file:/, "")), { recursive: true });
}
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });

async function main() {
  console.log(`\nTarget: ${url.startsWith("file:") ? "LOCAL" : "PRODUCTION (Turso)"}\n`);
  // Upsert settings row 1 with the new phone, keeping other defaults.
  await client.execute({
    sql: `INSERT INTO settings (id, promo_banner_text, promo_banner_enabled, shop_phone, shop_email, updated_at)
          VALUES (1, 'Чанарын баталгаатай | Шуурхай хүргэлт', 1, ?, 'info@zozo.mn', unixepoch())
          ON CONFLICT(id) DO UPDATE SET shop_phone = excluded.shop_phone, updated_at = unixepoch()`,
    args: [PHONE],
  });
  console.log(`✓ shop_phone set to ${PHONE}\n`);
  process.exit(0);
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
