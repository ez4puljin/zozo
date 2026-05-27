import Link from "next/link";
import Image from "next/image";
import { formatMNT } from "@/lib/utils";

interface ProductCardProps {
  slug: string;
  name: string;
  imageUrl: string | null;
  priceMnt: number;
  compareAtMnt: number | null;
  discountPercent: number;
}

export function ProductCard({
  slug,
  name,
  imageUrl,
  priceMnt,
  compareAtMnt,
  discountPercent,
}: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group block overflow-hidden rounded-lg border bg-background hover:shadow-md transition"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition group-hover:scale-[1.02]"
          />
        ) : null}
        {discountPercent > 0 ? (
          <span className="absolute bottom-3 left-3 rounded-md bg-foreground text-background px-2 py-1 text-[11px] font-semibold uppercase tracking-wider">
            -{discountPercent}% хямдрал
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium line-clamp-2">{name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold">{formatMNT(priceMnt)}</span>
          {compareAtMnt && compareAtMnt > priceMnt ? (
            <span className="text-xs text-muted-foreground line-through-thin">
              {formatMNT(compareAtMnt)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
