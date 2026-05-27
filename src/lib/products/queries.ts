import { db } from "@/lib/db";
import { products, productImages, productVariants } from "@/lib/schema";
import { eq, asc, and } from "drizzle-orm";

export type ProductDetail = Awaited<ReturnType<typeof getProductBySlug>>;

export async function getProductBySlug(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));

  if (!product) return null;

  const [images, variants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.position)),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id))
      .orderBy(asc(productVariants.position)),
  ]);

  return { ...product, images, variants };
}

export async function getActiveProductsList(opts?: {
  sort?: "newest" | "price-asc" | "price-desc";
  available?: boolean;
  min?: number;
  max?: number;
}) {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      basePriceMnt: products.basePriceMnt,
      compareAtPriceMnt: products.compareAtPriceMnt,
      discountPercent: products.discountPercent,
      stock: products.stock,
      position: products.position,
      createdAt: products.createdAt,
    })
    .from(products)
    .where(eq(products.status, "active"));

  // Filter
  let list = rows;
  if (opts?.available) list = list.filter((p) => p.stock > 0);
  if (opts?.min != null) list = list.filter((p) => p.basePriceMnt >= opts.min!);
  if (opts?.max != null) list = list.filter((p) => p.basePriceMnt <= opts.max!);

  // Sort
  switch (opts?.sort) {
    case "newest":
      list = list.sort((a, b) => +b.createdAt - +a.createdAt);
      break;
    case "price-asc":
      list = list.sort((a, b) => a.basePriceMnt - b.basePriceMnt);
      break;
    case "price-desc":
      list = list.sort((a, b) => b.basePriceMnt - a.basePriceMnt);
      break;
    default:
      list = list.sort((a, b) => a.position - b.position);
  }

  // Attach primary image
  const withImages = await Promise.all(
    list.map(async (p) => {
      const primary = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(and(eq(productImages.productId, p.id), eq(productImages.isPrimary, true)))
        .limit(1);
      const fallback = !primary[0]
        ? await db
            .select({ url: productImages.url })
            .from(productImages)
            .where(eq(productImages.productId, p.id))
            .orderBy(asc(productImages.position))
            .limit(1)
        : [];
      return { ...p, imageUrl: primary[0]?.url ?? fallback[0]?.url ?? null };
    })
  );

  return withImages;
}

export async function getAllProductSlugs() {
  return db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.status, "active"));
}
