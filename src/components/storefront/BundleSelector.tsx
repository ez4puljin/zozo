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

/**
 * Detect whether this is a "size" picker (all variants ship a single unit and
 * no bundle badges) or a "bundle" picker (multi-pack deals). Size variants get
 * a compact horizontal grid of buttons; bundles get the rich card layout.
 */
function isSizeMode(variants: VariantOption[]): boolean {
  if (variants.length === 0) return false;
  return variants.every((v) => v.unitsPerBundle === 1);
}

export function BundleSelector({ variants, selectedId, onChange }: Props) {
  const sizeMode = isSizeMode(variants);
  return sizeMode ? (
    <SizePicker variants={variants} selectedId={selectedId} onChange={onChange} />
  ) : (
    <BundlePicker variants={variants} selectedId={selectedId} onChange={onChange} />
  );
}

/* ---------------- Compact size picker ---------------- */

function SizePicker({ variants, selectedId, onChange }: Props) {
  const selected = variants.find((v) => v.id === selectedId);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">Хэмжээ сонгох</span>
        {selected ? (
          <span className="font-semibold text-foreground">{selected.label.split(" ")[0]}</span>
        ) : null}
      </div>
      <div
        className={cn(
          "grid gap-2",
          variants.length <= 2 && "grid-cols-2",
          variants.length === 3 && "grid-cols-3",
          variants.length >= 4 && "grid-cols-2 sm:grid-cols-4"
        )}
      >
        {variants.map((v) => {
          const isSelected = v.id === selectedId;
          // Use the first "word" as the short size token (e.g. "1м25см")
          const shortLabel = v.label.split(/[ (—·]/)[0];
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 rounded-lg border px-3 py-3 transition",
                isSelected
                  ? "border-foreground ring-2 ring-foreground bg-background"
                  : "hover:border-foreground/60 hover:bg-muted/40"
              )}
            >
              {v.badge ? (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground text-background px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider">
                  {v.badge}
                </span>
              ) : null}
              <span className="text-sm font-bold">{shortLabel}</span>
              <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                {formatMNT(v.priceMnt)}
              </span>
            </button>
          );
        })}
      </div>
      {/* Show the full label of the selected size as a clarification */}
      {selected && selected.label !== selected.label.split(/[ (—·]/)[0] ? (
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          📐 {selected.label}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------- Bundle deal card picker ---------------- */

function BundlePicker({ variants, selectedId, onChange }: Props) {
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
                      -{v.discountPercent}% хэмнэлт
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
