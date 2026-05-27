import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { products, productImages, productVariants } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { ProductForm, type ProductFormInitial } from "@/components/admin/ProductForm";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const [p] = await db.select().from(products).where(eq(products.id, id));
  if (!p) notFound();
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(asc(productImages.position));
  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, id))
    .orderBy(asc(productVariants.position));

  const initial: ProductFormInitial = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    descriptionMd: p.descriptionMd,
    howToUseMd: p.howToUseMd,
    basePriceMnt: p.basePriceMnt,
    compareAtPriceMnt: p.compareAtPriceMnt,
    discountPercent: p.discountPercent,
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    status: p.status,
    rating: p.rating,
    ratingCount: p.ratingCount,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    position: p.position,
    variants: variants.map((v) => ({
      id: v.id,
      label: v.label,
      unitsPerBundle: v.unitsPerBundle,
      priceMnt: v.priceMnt,
      compareAtPriceMnt: v.compareAtPriceMnt,
      discountPercent: v.discountPercent,
      isDefault: v.isDefault,
      position: v.position,
      badge: v.badge,
    })),
    images: images.map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      position: i.position,
      isPrimary: i.isPrimary,
    })),
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{p.name}</h1>
      <ProductForm initial={initial} />
    </div>
  );
}
