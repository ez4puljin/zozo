"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface Props {
  productCount: number;
  defaultSort: string;
  defaultAvailable: boolean;
  defaultMin?: number;
  defaultMax?: number;
}

export function CatalogControls({
  productCount,
  defaultSort,
  defaultAvailable,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const ns = new URLSearchParams(sp.toString());
      if (value === null || value === "") ns.delete(key);
      else ns.set(key, value);
      router.replace(`?${ns.toString()}`);
    },
    [router, sp]
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Шүүлт:</span>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked={defaultAvailable}
            onChange={(e) => setParam("available", e.target.checked ? "1" : null)}
            className="h-4 w-4"
          />
          Нөөцтэй
        </label>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Эрэмбэлэх:</span>
        <select
          defaultValue={defaultSort}
          onChange={(e) =>
            setParam("sort", e.target.value === "default" ? null : e.target.value)
          }
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="default">Үндсэн</option>
          <option value="newest">Шинэ</option>
          <option value="price-asc">Үнэ: Хямд → Үнэтэй</option>
          <option value="price-desc">Үнэ: Үнэтэй → Хямд</option>
        </select>
        <span className="text-sm text-muted-foreground">
          {productCount} бараа
        </span>
      </div>
    </div>
  );
}
