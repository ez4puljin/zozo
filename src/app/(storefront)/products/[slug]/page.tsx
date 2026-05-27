import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/products/queries";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { ProductPurchasePanel } from "@/components/storefront/ProductPurchasePanel";
import { HowToUseAccordion } from "@/components/storefront/HowToUseAccordion";
import { ViewContentTracker } from "@/components/storefront/PixelTrackers";
import { env } from "@/lib/env";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const image = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;
  const description =
    product.seoDescription ??
    product.descriptionMd.slice(0, 160) ??
    "Чанарын баталгаатай бараа, шуурхай хүргэлт.";

  return {
    title: product.seoTitle ?? product.name,
    description,
    openGraph: {
      title: product.seoTitle ?? product.name,
      description,
      images: image ? [{ url: image }] : [],
      type: "website",
      url: `${env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: product.seoTitle ?? product.name,
      description,
      images: image ? [image] : [],
    },
    other: {
      "product:price:amount": product.basePriceMnt.toString(),
      "product:price:currency": "MNT",
      "og:price:amount": product.basePriceMnt.toString(),
      "og:price:currency": "MNT",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.status !== "active") notFound();

  const primaryImage =
    product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? null;

  // Sort variants by position; pre-select isDefault one
  const variants = [...product.variants].sort((a, b) => a.position - b.position);
  const defaultVariantId =
    variants.find((v) => v.isDefault)?.id ?? variants[0]?.id ?? "";

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <ViewContentTracker
        productId={product.id}
        value={product.basePriceMnt}
        currency="MNT"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <ProductGallery images={product.images} name={product.name} />

        <ProductPurchasePanel
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
          primaryImageUrl={primaryImage}
          rating={product.rating}
          ratingCount={product.ratingCount}
          variants={variants.map((v) => ({
            id: v.id,
            label: v.label,
            unitsPerBundle: v.unitsPerBundle,
            priceMnt: v.priceMnt,
            compareAtPriceMnt: v.compareAtPriceMnt,
            discountPercent: v.discountPercent,
            badge: v.badge,
          }))}
          defaultVariantId={defaultVariantId}
        />
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <HowToUseAccordion
            descriptionMd={product.descriptionMd}
            howToUseMd={product.howToUseMd}
          />
        </div>
      </div>
    </article>
  );
}
