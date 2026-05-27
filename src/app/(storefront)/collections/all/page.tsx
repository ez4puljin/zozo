import type { Metadata } from "next";
import { getActiveProductsList } from "@/lib/products/queries";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CatalogControls } from "@/components/storefront/CatalogControls";

export const metadata: Metadata = {
  title: "Бараа",
  description: "Бүх барааг үзэх, хайх, ангилах.",
};

export const revalidate = 60;

type SortKey = "newest" | "price-asc" | "price-desc";

interface Props {
  searchParams: Promise<{
    sort?: string;
    available?: string;
    min?: string;
    max?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sort = (["newest", "price-asc", "price-desc"].includes(sp.sort ?? "")
    ? (sp.sort as SortKey)
    : undefined) as SortKey | undefined;
  const available = sp.available === "1";
  const min = sp.min ? Number(sp.min) : undefined;
  const max = sp.max ? Number(sp.max) : undefined;

  const list = await getActiveProductsList({ sort, available, min, max });

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Бараа</h1>
      </header>

      <CatalogControls
        productCount={list.length}
        defaultSort={sort ?? "default"}
        defaultAvailable={available}
        defaultMin={min}
        defaultMax={max}
      />

      {list.length === 0 ? (
        <div className="mt-10 text-center text-sm text-muted-foreground py-16 border rounded-lg">
          Илэрц олдсонгүй.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {list.map((p) => (
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
  );
}
