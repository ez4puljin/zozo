import Link from "next/link";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/schema";
import { eq, asc, and } from "drizzle-orm";
import { ProductCard } from "@/components/storefront/ProductCard";
import { TrustStrip } from "@/components/storefront/TrustStrip";

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
      {/* Hero — editorial */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-28 text-center">
          <div className="zz-eyebrow zz-eyebrow-hero mb-5">
            Авахдаа төлөх · Шуурхай хүргэлт
          </div>
          <h1
            className="font-bold leading-[0.98]"
            style={{
              fontSize: "clamp(2.75rem, 6.5vw, 5rem)",
              letterSpacing: "-0.035em",
            }}
          >
            Чанартай бараа,
            <br />
            шуурхай хүргэлт.
          </h1>
          <p className="mx-auto mt-6 max-w-[540px] text-lg leading-relaxed text-muted-foreground">
            Зөвхөн өнөөдөр захиалбал — хүргэлт үнэгүй. Авахдаа төлөх боломжтой.
          </p>
          <div className="mt-9">
            <Link href="/collections/all" className="zz-btn-pill">
              Бараа үзэх
            </Link>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <TrustStrip />

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="zz-eyebrow mb-2">Шилдэг сонголт</div>
            <h2
              className="font-bold leading-tight"
              style={{
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                letterSpacing: "-0.025em",
              }}
            >
              Шилмэл бараа
            </h2>
          </div>
          <Link
            href="/collections/all"
            className="text-sm underline underline-offset-4 hover:opacity-70 transition"
          >
            Бүгдийг үзэх →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-16 border rounded-lg">
            Бараа удахгүй нэмэгдэнэ. (Admin-аас бараа нэмнэ үү.)
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
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
