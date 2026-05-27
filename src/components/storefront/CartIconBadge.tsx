"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { useEffect, useState } from "react";

export function CartIconBadge() {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.openCart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = mounted ? items.reduce((sum, it) => sum + it.quantity, 0) : 0;

  return (
    <button
      onClick={open}
      aria-label="Сагс"
      className="relative inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition"
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-semibold px-1">
          {count}
        </span>
      )}
    </button>
  );
}
