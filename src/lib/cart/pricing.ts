import type { CartItem, CartTotals } from "./types";

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
  const shippingMnt = 0; // free
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
