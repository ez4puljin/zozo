import Link from "next/link";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/schema";
import { eq, asc, and } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/ProductCard";

export const revalidate = 60;

async function getFeatured() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      basePriceMnt: products.basePriceMnt,
      compareAtPriceMnt: products.compareAtPriceMnt,
      discountPercent: products.discountPercent,
    })
    .from(products)
    .where(eq(products.status, "active"))
    .orderBy(asc(products.position))
    .limit(8);

  // Fetch primary image per product
  const withImages = await Promise.all(
    rows.map(async (p) => {
      const img = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(and(eq(productImages.productId, p.id), eq(productImages.isPrimary, true)))
        .limit(1);
      const fallback = !img[0]
        ? await db
            .select({ url: productImages.url })
            .from(productImages)
            .where(eq(productImages.productId, p.id))
            .orderBy(asc(productImages.position))
            .limit(1)
        : [];
      return { ...p, imageUrl: img[0]?.url ?? fallback[0]?.url ?? null };
    })
  );

  return withImages;
}

export default async function Home() {
  const featured = await getFeatured().catch(() => []);

  return (
    <>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Чанартай бараа, <br className="hidden sm:inline" />
            шуурхай хүргэлт.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Зөвхөн өнөөдөр захиалбал — хүргэлт үнэгүй. Авахдаа төлөх боломжтой.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/collections/all"
              className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90 transition"
            >
              Бараа үзэх
            </Link>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Шилмэл бараа
          </h2>
          <Link
            href="/collections/all"
            className="text-sm underline underline-offset-4 hover:opacity-70"
          >
            Бүгдийг үзэх →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12 border rounded-lg">
            Бараа удахгүй нэмэгдэнэ. (Admin-аас бараа нэмнэ үү.)
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((p) => (
              <ProductCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                imageUrl={p.imageUrl}
                priceMnt={p.basePriceMnt}
                compareAtMnt={p.compareAtPriceMnt}
                discountPercent={p.discountPercent}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
