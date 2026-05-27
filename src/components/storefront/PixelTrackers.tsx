"use client";

import { useEffect } from "react";

export function ViewContentTracker({
  productId,
  value,
  currency,
}: {
  productId: string;
  value: number;
  currency: string;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "ViewContent", {
        content_ids: [productId],
        content_type: "product",
        value,
        currency,
      });
    }
  }, [productId, value, currency]);
  return null;
}

export function InitiateCheckoutTracker({
  value,
  currency,
  contentIds,
}: {
  value: number;
  currency: string;
  contentIds: string[];
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout", {
        value,
        currency,
        content_ids: contentIds,
      });
    }
  }, [value, currency, contentIds]);
  return null;
}
