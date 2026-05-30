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
    <Link href={`/products/${slug}`} className="zz-pcard group block">
      <div className="zz-pcard-img relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : null}
        {discountPercent > 0 ? (
          <span className="absolute top-3 left-3 rounded-full bg-foreground/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-background">
            -{discountPercent}% хямдрал
          </span>
        ) : null}
      </div>
      <div className="px-1 pt-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight">
          {name}
        </h3>
        <div className="mt-1.5 flex items-baseline gap-2">
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
