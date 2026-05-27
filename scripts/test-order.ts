// Quick smoke test: insert a fake order to verify the schema & relations work.
// Run: npx tsx scripts/test-order.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  products,
  productVariants,
  orders,
  orderItems,
  dailyCounter,
} from "../drizzle/schema";
import { sql, eq } from "drizzle-orm";
import crypto from "node:crypto";

const url = process.env.DATABASE_URL!;
const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client);

async function main() {
  console.log("Test: inserting a fake order…");

  // Find first variant
  const [variant] = await db.select().from(productVariants).limit(1);
  if (!variant) {
    console.error("No variants. Run seed first.");
    process.exit(1);
  }
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, variant.productId));

  // Generate order number
  const now = new Date();
  const dayKey = `${String(now.getUTCFullYear()).slice(2)}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  await db
    .insert(dailyCounter)
    .values({ dayKey, lastSeq: 1 })
    .onConflictDoUpdate({
      target: dailyCounter.dayKey,
      set: { lastSeq: sql`${dailyCounter.lastSeq} + 1` },
    });
  const [counter] = await db
    .select()
    .from(dailyCounter)
    .where(eq(dailyCounter.dayKey, dayKey));
  const seq = String(counter.lastSeq).padStart(4, "0");
  const orderNumber = `ZZ-${dayKey}-${seq}`;

  const orderId = crypto.randomUUID();
  const quantity = 2;
  const lineTotal = variant.priceMnt * quantity;

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    status: "new",
    phone: "99112233",
    firstName: "Тест",
    lastName: "Хэрэглэгч",
    district: "Хан-Уул дүүрэг",
    khoroo: "15-р хороо",
    building: "12-р байр, 3 орц, 5 давхар, 27 тоот",
    notes: "Анхааруулах: дамжуулагч ажилтан утсаар холбогдоно уу.",
    subtotalMnt: lineTotal,
    totalMnt: lineTotal,
    discountMnt: (variant.compareAtPriceMnt ?? variant.priceMnt) * quantity - lineTotal,
    paymentMethod: "cod",
  });

  await db.insert(orderItems).values({
    id: crypto.randomUUID(),
    orderId,
    productId: variant.productId,
    variantId: variant.id,
    productNameSnapshot: product?.name ?? "Unknown",
    variantLabelSnapshot: variant.label,
    productImageSnapshot: null,
    unitPriceMnt: variant.priceMnt,
    compareAtMnt: variant.compareAtPriceMnt,
    unitsPerBundle: variant.unitsPerBundle,
    quantity,
    lineTotalMnt: lineTotal,
  });

  console.log(`✓ Created order #${orderNumber} (${variant.label} × ${quantity}, ${lineTotal}₮)`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
