import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  products,
  productImages,
  productVariants,
  settings,
} from "../drizzle/schema";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import crypto from "node:crypto";

const url = process.env.DATABASE_URL || "file:./data/zozo.db";

if (url.startsWith("file:")) {
  mkdirSync(dirname(url.replace(/^file:/, "")), { recursive: true });
}

const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
const db = drizzle(client);

const newId = () => crypto.randomUUID();

async function main() {
  console.log("Seeding…");

  // Settings (singleton)
  await db
    .insert(settings)
    .values({
      id: 1,
      promoBannerText: "Чанарын баталгаатай | Шуурхай хүргэлт",
      promoBannerEnabled: true,
      shopPhone: "9999-9999",
      shopEmail: "info@zozo.mn",
    })
    .onConflictDoNothing();

  // Wipe existing products (idempotent dev seed)
  await db.delete(productVariants);
  await db.delete(productImages);
  await db.delete(products);

  // ---- Product 1: Mushroom coffee (RYZE-style) ----
  const p1 = newId();
  await db.insert(products).values({
    id: p1,
    slug: "moogtei-coffee",
    name: "Мөөгтэй кофе",
    descriptionMd:
      "30 хоног уух кофе. Сар бүр өдөр бүр 1 амттай аяга уу, эрчим хүч, сэтгэлийн төвлөрөл, ходоодны эрүүл мэндийг сайжруулна. Мөн эрүүлээр жин хасахад тусална.",
    howToUseMd:
      "1 халбага RYZE кофе нунтаг + 150-200 мл буцалсан ус, эсвэл сүүтэй хольж уугаарай. Өдөр бүр өглөө 1 удаа уух нь хамгийн тохиромжтой.",
    basePriceMnt: 59000,
    compareAtPriceMnt: 89000,
    discountPercent: 33,
    stock: 100,
    status: "active",
    rating: 4.7,
    ratingCount: 1648,
    seoTitle: "Мөөгтэй кофе — Эрүүл мэндийн №1 кофе",
    seoDescription:
      "USDA органик баталгаатай мөөгтэй кофе. Эрчим хүч, төвлөрөл, эрүүл мэндийг сайжруулна.",
    position: 1,
  });

  await db.insert(productImages).values([
    {
      id: newId(),
      productId: p1,
      url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
      alt: "Мөөгтэй кофе сав",
      position: 0,
      isPrimary: true,
    },
    {
      id: newId(),
      productId: p1,
      url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80",
      alt: "Бэлэн уух кофе",
      position: 1,
      isPrimary: false,
    },
    {
      id: newId(),
      productId: p1,
      url: "https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=1200&q=80",
      alt: "Шилэн аяганд",
      position: 2,
      isPrimary: false,
    },
  ]);

  await db.insert(productVariants).values([
    {
      id: newId(),
      productId: p1,
      label: "1 ширхэг",
      unitsPerBundle: 1,
      priceMnt: 59000,
      compareAtPriceMnt: 89000,
      discountPercent: 33,
      isDefault: false,
      position: 0,
      badge: "1 САР",
    },
    {
      id: newId(),
      productId: p1,
      label: "2 авбал 1 БЭЛЭГ",
      unitsPerBundle: 3,
      priceMnt: 118000,
      compareAtPriceMnt: 178000,
      discountPercent: 34,
      isDefault: true,
      position: 1,
      badge: "ХАМГИЙН ТОХИРОМЖТОЙ",
    },
  ]);

  // ---- Product 2: Coллаген ----
  const p2 = newId();
  await db.insert(products).values({
    id: p2,
    slug: "collagen-powder",
    name: "Коллаген нунтаг",
    descriptionMd:
      "Арьс, үс, хумсыг сайжруулах, үе мөчний эрүүл мэндийг хамгаалах премиум коллаген. Өдөрт 1 халбага уугаарай.",
    howToUseMd: "1 халбага нунтгийг 200 мл усаар найруулна.",
    basePriceMnt: 79000,
    compareAtPriceMnt: 99000,
    discountPercent: 20,
    stock: 60,
    status: "active",
    rating: 4.6,
    ratingCount: 432,
    position: 2,
  });
  await db.insert(productImages).values([
    {
      id: newId(),
      productId: p2,
      url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
      alt: "Коллаген нунтаг",
      position: 0,
      isPrimary: true,
    },
  ]);
  await db.insert(productVariants).values([
    {
      id: newId(),
      productId: p2,
      label: "1 сав",
      unitsPerBundle: 1,
      priceMnt: 79000,
      compareAtPriceMnt: 99000,
      discountPercent: 20,
      isDefault: true,
      position: 0,
    },
    {
      id: newId(),
      productId: p2,
      label: "3 сав — 1 БЭЛЭГ",
      unitsPerBundle: 4,
      priceMnt: 237000,
      compareAtPriceMnt: 396000,
      discountPercent: 40,
      isDefault: false,
      position: 1,
      badge: "ХЭМНЭЛТ",
    },
  ]);

  // ---- Product 3: Иммун эликсир ----
  const p3 = newId();
  await db.insert(products).values({
    id: p3,
    slug: "immune-elixir",
    name: "Иммун дэмжих эликсир",
    descriptionMd:
      "Дархлааг бэхжүүлэх, ханиад томуунаас сэргийлэх ургамлын найрлагатай шинэлэг бүтээгдэхүүн.",
    howToUseMd: "Өдөрт 2 удаа, 1 халбагаар уугаарай.",
    basePriceMnt: 49000,
    compareAtPriceMnt: 69000,
    discountPercent: 29,
    stock: 80,
    status: "active",
    rating: 4.8,
    ratingCount: 215,
    position: 3,
  });
  await db.insert(productImages).values([
    {
      id: newId(),
      productId: p3,
      url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=1200&q=80",
      alt: "Иммун эликсир",
      position: 0,
      isPrimary: true,
    },
  ]);
  await db.insert(productVariants).values([
    {
      id: newId(),
      productId: p3,
      label: "1 шил",
      unitsPerBundle: 1,
      priceMnt: 49000,
      compareAtPriceMnt: 69000,
      discountPercent: 29,
      isDefault: true,
      position: 0,
    },
    {
      id: newId(),
      productId: p3,
      label: "2 шил — 1 БЭЛЭГ",
      unitsPerBundle: 3,
      priceMnt: 98000,
      compareAtPriceMnt: 207000,
      discountPercent: 53,
      isDefault: false,
      position: 1,
      badge: "ХЯМД",
    },
  ]);

  console.log("✓ Seeded 3 products with variants & images, settings row.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
