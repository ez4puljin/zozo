"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Minus, Plus } from "lucide-react";
import { BundleSelector, type VariantOption } from "./BundleSelector";
import { formatMNT } from "@/lib/utils";
import { useCart } from "@/lib/cart/store";

interface Props {
  productId: string;
  productSlug: string;
  productName: string;
  primaryImageUrl: string | null;
  variants: VariantOption[];
  defaultVariantId: string;
  rating: number | null;
  ratingCount: number;
}

export function ProductPurchasePanel({
  productId,
  productSlug,
  productName,
  primaryImageUrl,
  variants,
  defaultVariantId,
  rating,
  ratingCount,
}: Props) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const [selectedId, setSelectedId] = useState<string>(
    defaultVariantId || variants[0]?.id || ""
  );
  const [qty, setQty] = useState(1);
  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  if (!selected) return null;

  const handleAdd = (goToCheckout?: boolean) => {
    addItem({
      productId,
      variantId: selected.id,
      productSlug,
      productName,
      variantLabel: selected.label,
      imageUrl: primaryImageUrl,
      unitsPerBundle: selected.unitsPerBundle,
      unitPriceMnt: selected.priceMnt,
      compareAtMnt: selected.compareAtPriceMnt,
      quantity: qty,
    });
    if (typeof window !== "undefined" && (window as { fbq?: (...args: unknown[]) => void }).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq(
        "track",
        "AddToCart",
        {
          value: selected.priceMnt * qty,
          currency: "MNT",
          content_ids: [productId],
          content_type: "product",
        }
      );
    }
    if (goToCheckout) {
      router.push("/checkout");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{productName}</h1>
        {rating != null && ratingCount > 0 ? (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < Math.round(rating)
                      ? "h-4 w-4 fill-foreground text-foreground"
                      : "h-4 w-4 text-muted-foreground"
                  }
                />
              ))}
            </div>
            <span className="text-muted-foreground">
              ({ratingCount.toLocaleString()} сэтгэгдэл)
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold">{formatMNT(selected.priceMnt)}</span>
        {selected.compareAtPriceMnt && selected.compareAtPriceMnt > selected.priceMnt ? (
          <>
            <span className="text-base text-muted-foreground line-through-thin">
              {formatMNT(selected.compareAtPriceMnt)}
            </span>
            <span className="ml-1 rounded bg-foreground text-background px-2 py-0.5 text-xs font-semibold">
              -{selected.discountPercent}%
            </span>
          </>
        ) : null}
      </div>

      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-center py-2 border-y mb-3">
          Энэ 7 хоногийн урамшуулал
        </div>
        <BundleSelector
          variants={variants}
          selectedId={selectedId}
          onChange={setSelectedId}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Тоо:</span>
        <div className="inline-flex items-center rounded-md border">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="px-3 py-2 hover:bg-muted transition"
            aria-label="Хасах"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-10 text-center text-sm">{qty}</span>
          <button
            onClick={() => setQty(qty + 1)}
            className="px-3 py-2 hover:bg-muted transition"
            aria-label="Нэмэх"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        onClick={() => handleAdd(true)}
        className="block w-full rounded-md bg-foreground py-4 text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90 transition"
      >
        Захиалах
      </button>
      <button
        onClick={() => handleAdd(false)}
        className="block w-full rounded-md border py-3 text-sm font-medium hover:bg-muted transition"
      >
        Сагсанд нэмэх
      </button>

      <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2.5 text-xs">
        <span className="font-medium">🚚 Зөвхөн өнөөдөр захиалбал хүргэлт ҮНЭГҮЙ!</span>
      </div>
    </div>
  );
}
