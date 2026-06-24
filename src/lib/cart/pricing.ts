import type { CartItem, CartTotals } from "./types";
import { SHIPPING_MNT } from "@/lib/constants";

export function computeTotals(items: CartItem[]): CartTotals {
  const itemCount = items.length;
  let bundleCount = 0;
  let unitCount = 0;
  let subtotalMnt = 0;
  let compareAtSubtotalMnt = 0;

  for (const it of items) {
    bundleCount += it.quantity;
    unitCount += it.quantity * it.unitsPerBundle;
    subtotalMnt += it.unitPriceMnt * it.quantity;
    compareAtSubtotalMnt += (it.compareAtMnt ?? it.unitPriceMnt) * it.quantity;
  }
  const savingsMnt = Math.max(0, compareAtSubtotalMnt - subtotalMnt);
  // Flat city-zone-A delivery fee; no shipping on an empty cart.
  const shippingMnt = items.length > 0 ? SHIPPING_MNT : 0;
  const totalMnt = subtotalMnt + shippingMnt;

  return {
    itemCount,
    bundleCount,
    unitCount,
    subtotalMnt,
    compareAtSubtotalMnt,
    savingsMnt,
    shippingMnt,
    totalMnt,
  };
}
