"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, CartTotals } from "./types";
import { computeTotals } from "./pricing";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "key" | "quantity"> & { quantity?: number }) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  totals: () => CartTotals;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (it) => {
        const key = `${it.productId}::${it.variantId}`;
        const qty = it.quantity ?? 1;
        const existing = get().items.find((x) => x.key === key);
        if (existing) {
          set({
            items: get().items.map((x) =>
              x.key === key ? { ...x, quantity: x.quantity + qty } : x
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...it, key, quantity: qty } as CartItem,
            ],
            isOpen: true,
          });
        }
      },
      removeItem: (key) => set({ items: get().items.filter((x) => x.key !== key) }),
      updateQty: (key, qty) => {
        if (qty < 1) {
          set({ items: get().items.filter((x) => x.key !== key) });
        } else {
          set({
            items: get().items.map((x) => (x.key === key ? { ...x, quantity: qty } : x)),
          });
        }
      },
      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      totals: () => computeTotals(get().items),
    }),
    {
      name: "zozo-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    }
  )
);
