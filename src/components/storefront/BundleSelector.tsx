"use client";

import { Check } from "lucide-react";
import { cn, formatMNT } from "@/lib/utils";

export interface VariantOption {
  id: string;
  label: string;
  unitsPerBundle: number;
  priceMnt: number;
  compareAtPriceMnt: number | null;
  discountPercent: number;
  badge: string | null;
}

interface Props {
  variants: VariantOption[];
  selectedId: string;
  onChange: (id: string) => void;
}

export function BundleSelector({ variants, selectedId, onChange }: Props) {
  return (
    <div className="space-y-3">
      {variants.map((v) => {
        const selected = v.id === selectedId;
        return (
          <label
            key={v.id}
            className={cn(
              "relative block cursor-pointer rounded-lg border p-4 transition",
              selected ? "border-foreground ring-2 ring-foreground" : "hover:border-foreground/50"
            )}
          >
            {v.badge ? (
              <span className="absolute -top-2.5 right-4 rounded-md bg-foreground text-background px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {v.badge}
              </span>
            ) : null}
            <input
              type="radio"
              name="variant"
              value={v.id}
              checked={selected}
              onChange={() => onChange(v.id)}
              className="sr-only"
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                    selected ? "border-foreground bg-foreground" : "border-muted-foreground"
                  )}
                >
                  {selected ? <Check className="h-3 w-3 text-background" /> : null}
                </span>
                <div>
                  <div className="font-semibold">{v.label}</div>
                  {v.discountPercent > 0 ? (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formatMNT(v.priceMnt)} хэмнэлт
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatMNT(v.priceMnt)}</div>
                {v.compareAtPriceMnt && v.compareAtPriceMnt > v.priceMnt ? (
                  <div className="text-xs text-muted-foreground line-through-thin">
                    {formatMNT(v.compareAtPriceMnt)}
                  </div>
                ) : null}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
