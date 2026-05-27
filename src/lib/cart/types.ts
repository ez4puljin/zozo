export interface CartItem {
  /** Stable key: productId + variantId */
  key: string;
  productId: string;
  variantId: string;
  productSlug: string;
  productName: string;
  variantLabel: string;
  imageUrl: string | null;
  unitsPerBundle: number;
  unitPriceMnt: number;
  compareAtMnt: number | null;
  quantity: number;
}

export interface CartTotals {
  itemCount: number;        // number of cart lines
  bundleCount: number;      // sum of quantities (bundles)
  unitCount: number;        // sum of units (qty × unitsPerBundle)
  subtotalMnt: number;      // sum of (unitPriceMnt × quantity)
  compareAtSubtotalMnt: number;
  savingsMnt: number;
  shippingMnt: number;
  totalMnt: number;
}
