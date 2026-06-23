// One-shot importer: wipe existing products & insert the 7 items from баараа.docx.
// Run locally:        npx tsx scripts/import-baraa.ts
// Run vs Turso (prod):
//   $env:DATABASE_URL = "libsql://zozo-xxxx.turso.io"
//   $env:DATABASE_AUTH_TOKEN = "eyJ..."
//   npx tsx scripts/import-baraa.ts
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import {
  products,
  productImages,
  productVariants,
  orderItems,
  orders,
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

interface ProductInput {
  slug: string;
  name: string;
  type?: string;
  description: string;
  howToUse?: string;
  basePrice: number;
  compareAt?: number;
  discount?: number;
  stock?: number;
  variants?: {
    label: string;
    unitsPerBundle?: number;
    priceMnt: number;
    compareAt?: number;
    badge?: string;
    isDefault?: boolean;
  }[];
}

const ITEMS: ProductInput[] = [
  {
    slug: "avtomat-dugui-khiilegch-dankhrat",
    name: "Автомат дугуй хийлэгч данхрат",
    description:
      "Олон үйлдэлт автомат данхрат. Дараах зориулалттай:\n\n• Данхраат\n• Гар чийдэн\n• Дугуй хийлэгч",
    howToUse:
      "Цэнэглэгдэх батерейтай. Хошуугаа тохирох хэмжээгээр сонгоод асаагаад хэрэглэнэ.",
    basePrice: 350_000,
    stock: 20,
  },
  {
    slug: "avtomat-mashin-ugaagch-buu",
    name: "Автомат машин угаагч буу",
    description:
      "Батерейтай, утасгүй автомат угаагч.\n\n• Батерейтай\n• 2 төрлийн хошуу сольж шүршинэ",
    howToUse: "Цэнэглэн хэрэглэх. Хошуугаа сонгож шүршинэ.",
    basePrice: 75_000,
    stock: 30,
  },
  {
    // Цүнхэн бокс — нэг бүтээгдэхүүн дотор 3 хэмжээ variant хэлбэрээр
    slug: "tsunkhen-boks",
    name: "Цүнхэн бокс",
    description:
      "Машинд суурилуулах цүнхэн (rooftop) бокс. Гурван хэмжээтэй:\n\n• 1м25см (200,000₮)\n• 1м45см (230,000₮)\n• 1м65см (265,000₮)",
    howToUse:
      "Машины дээвэр дээр зориулсан суурьтай. Захиалахдаа доорх хэмжээгээс сонгоно уу.",
    basePrice: 200_000,
    stock: 15,
    variants: [
      {
        label: "1м25см — урт 1250мм · өргөн 950мм · өндөр 450мм",
        unitsPerBundle: 1,
        priceMnt: 200_000,
        isDefault: true,
      },
      {
        label: "1м45см — урт 1450мм · өргөн 950мм · өндөр 450мм",
        unitsPerBundle: 1,
        priceMnt: 230_000,
      },
      {
        label: "1м65см — урт 1650мм · өргөн 950мм · өндөр 450мм",
        unitsPerBundle: 1,
        priceMnt: 265_000,
        badge: "ТОМ",
      },
    ],
  },
  {
    slug: "olon-uildelt-tuslamj",
    name: "Олон үйлдэлт тусгай хэрэгсэл",
    description:
      "Нэг хэрэгслээр олон зориулалтаар ашиглах боломжтой.\n\n• Машин асаагч\n• Гар чийдэн\n• Повер банк болно\n• Дугуй хийлнэ\n• Олон төрлийн зүйл хийлнэ — хошуугаа солиод",
    howToUse:
      "Хошуу болон горимоо тохируулаад хэрэглэнэ. Машин асаахдаа машины батерейтэй холбож хэрэглэнэ.",
    basePrice: 215_000,
    stock: 25,
  },
  {
    slug: "uurgan-gerel-4m",
    name: "Уурган гэрэл — 4м",
    description:
      "4 метр өргөгдөх уурган суурьтай хүчирхэг лед гэрэл.\n\n• Урт: 4м\n• 300ватт лед гэрэлтэй",
    howToUse:
      "Уурган суурийг газарт босгож, гэрэлийг асаана. Барилгын талбай, аян жуулчлал, гадаа хурал зэрэгт тохиромжтой.",
    basePrice: 80_000,
    stock: 40,
  },
];

async function main() {
  const isProd = !url.startsWith("file:");
  console.log(`\nTarget DB: ${isProd ? "PRODUCTION (Turso)" : "LOCAL (SQLite)"}\n${url.slice(0, 60)}...\n`);

  // Safety: count existing data
  const [pCount] = await db
    .select({ c: products.id })
    .from(products)
    .limit(1)
    .then((r) => [{ c: r.length }]);
  const [oCount] = await db
    .select({ c: orders.id })
    .from(orders)
    .limit(1)
    .then((r) => [{ c: r.length }]);

  console.log(`Existing products: ${pCount.c > 0 ? "≥1" : "0"}`);
  console.log(`Existing orders:   ${oCount.c > 0 ? "≥1" : "0"}`);

  // Wipe in reverse FK order. order_items references products via RESTRICT,
  // so we delete order_items first when there are orders.
  console.log("\nWiping existing products + variants + images...");
  await db.delete(orderItems);
  await db.delete(productVariants);
  await db.delete(productImages);
  await db.delete(products);

  console.log("\nInserting", ITEMS.length, "products...\n");
  let pos = 0;
  for (const it of ITEMS) {
    const id = newId();
    await db.insert(products).values({
      id,
      slug: it.slug,
      name: it.name,
      descriptionMd: it.description,
      howToUseMd: it.howToUse ?? "",
      basePriceMnt: it.basePrice,
      compareAtPriceMnt: it.compareAt ?? null,
      discountPercent: it.discount ?? 0,
      stock: it.stock ?? 10,
      lowStockThreshold: 3,
      status: "active",
      rating: null,
      ratingCount: 0,
      seoTitle: null,
      seoDescription: null,
      position: pos++,
    });

    const variants =
      it.variants && it.variants.length > 0
        ? it.variants
        : [
            {
              label: "1 ширхэг",
              unitsPerBundle: 1,
              priceMnt: it.basePrice,
              compareAt: it.compareAt,
              isDefault: true,
            },
          ];

    let vpos = 0;
    let hasDefault = variants.some((v) => v.isDefault);
    for (const v of variants) {
      await db.insert(productVariants).values({
        id: newId(),
        productId: id,
        label: v.label,
        unitsPerBundle: v.unitsPerBundle ?? 1,
        priceMnt: v.priceMnt,
        compareAtPriceMnt: v.compareAt ?? null,
        discountPercent: 0,
        isDefault: hasDefault ? !!v.isDefault : vpos === 0,
        position: vpos++,
        badge: v.badge ?? null,
      });
    }

    console.log(
      `  ✓ ${it.name.padEnd(45)} ${new Intl.NumberFormat("mn-MN").format(it.basePrice)}₮ · ${variants.length} variant`
    );
  }

  console.log("\n✓ Done.\n");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
