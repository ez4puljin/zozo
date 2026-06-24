"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  productVariants,
  products,
  productImages,
} from "@/lib/schema";
import { eq, inArray, and, sql } from "drizzle-orm";
import { checkoutSubmitSchema, type CheckoutSubmit } from "@/lib/checkout/schema";
import { nextOrderNumber } from "@/lib/orders/orderNumber";
import { resend } from "@/lib/email/client";
import { NewOrderAdmin } from "@/lib/email/templates/NewOrderAdmin";
import { env } from "@/lib/env";
import { formatDate, newId } from "@/lib/utils";
import { SHIPPING_MNT } from "@/lib/constants";
import { createHash } from "node:crypto";

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string }
  | { ok: false; error: string };

export async function createOrderAction(input: unknown): Promise<CreateOrderResult> {
  const parsed = checkoutSubmitSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const data: CheckoutSubmit = parsed.data;

  try {
    // Refetch variants + products fresh to avoid trusting client-supplied prices
    const variantIds = data.items.map((i) => i.variantId);
    const dbVariants = await db
      .select({
        id: productVariants.id,
        productId: productVariants.productId,
        label: productVariants.label,
        unitsPerBundle: productVariants.unitsPerBundle,
        priceMnt: productVariants.priceMnt,
        compareAtPriceMnt: productVariants.compareAtPriceMnt,
      })
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    if (dbVariants.length !== data.items.length) {
      return { ok: false, error: "Бараа олдсонгүй (variant). Сагсаа шинэчилж туршина уу." };
    }

    const productIds = Array.from(new Set(dbVariants.map((v) => v.productId)));
    const dbProducts = await db
      .select({
        id: products.id,
        name: products.name,
        status: products.status,
      })
      .from(products)
      .where(inArray(products.id, productIds));

    const productById = new Map(dbProducts.map((p) => [p.id, p]));
    const variantById = new Map(dbVariants.map((v) => [v.id, v]));

    // Primary image lookups (batch)
    const allImages = await db
      .select({
        productId: productImages.productId,
        url: productImages.url,
        position: productImages.position,
        isPrimary: productImages.isPrimary,
      })
      .from(productImages)
      .where(inArray(productImages.productId, productIds));
    const imageByProduct = new Map<string, string>();
    for (const img of allImages.sort((a, b) => {
      // primary first, then by position
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      return a.position - b.position;
    })) {
      if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img.url);
    }

    // Validate every item references an active product
    for (const item of data.items) {
      const v = variantById.get(item.variantId);
      if (!v) return { ok: false, error: "Бараа олдсонгүй." };
      const p = productById.get(v.productId);
      if (!p || p.status !== "active") {
        return { ok: false, error: "Зарим бараа идэвхгүй болсон байна." };
      }
    }

    // Compute totals server-side
    let subtotal = 0;
    let compareAtSubtotal = 0;
    const itemsForDb = data.items.map((item) => {
      const v = variantById.get(item.variantId)!;
      const p = productById.get(v.productId)!;
      const lineTotal = v.priceMnt * item.quantity;
      const compareAt = (v.compareAtPriceMnt ?? v.priceMnt) * item.quantity;
      subtotal += lineTotal;
      compareAtSubtotal += compareAt;
      return {
        productId: v.productId,
        variantId: v.id,
        productName: p.name,
        variantLabel: v.label,
        imageUrl: imageByProduct.get(v.productId) ?? null,
        unitPriceMnt: v.priceMnt,
        compareAtMnt: v.compareAtPriceMnt,
        unitsPerBundle: v.unitsPerBundle,
        quantity: item.quantity,
        lineTotalMnt: lineTotal,
      };
    });

    const shipping = SHIPPING_MNT;
    const discount = Math.max(0, compareAtSubtotal - subtotal);
    const total = subtotal + shipping;

    const orderNumber = await nextOrderNumber();
    const orderId = newId();

    // IP hash for light fraud signal (not stored raw)
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0].trim() ??
      hdrs.get("x-real-ip") ??
      "";
    const ipHash = ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null;
    const ua = hdrs.get("user-agent") ?? null;

    // Single transaction
    await db.transaction(async (tx) => {
      await tx.insert(orders).values({
        id: orderId,
        orderNumber,
        status: "new",
        phone: data.customer.phone,
        firstName: data.customer.firstName,
        lastName: data.customer.lastName || "",
        country: "MN",
        district: data.customer.district,
        khoroo: data.customer.khoroo || null,
        building: data.customer.building || null,
        entrance: data.customer.entrance || null,
        floor: data.customer.floor || null,
        apartment: data.customer.apartment || null,
        additionalPhone: data.customer.additionalPhone || null,
        notes: data.customer.notes || null,
        subtotalMnt: subtotal,
        shippingMnt: shipping,
        discountMnt: discount,
        totalMnt: total,
        paymentMethod: "cod",
        userAgent: ua,
        ipHash,
        referrer: data.referrer ?? null,
        pixelEventId: data.pixelEventId ?? null,
      });

      await tx.insert(orderItems).values(
        itemsForDb.map((it) => ({
          id: newId(),
          orderId,
          productId: it.productId,
          variantId: it.variantId,
          productNameSnapshot: it.productName,
          variantLabelSnapshot: it.variantLabel,
          productImageSnapshot: it.imageUrl,
          unitPriceMnt: it.unitPriceMnt,
          compareAtMnt: it.compareAtMnt,
          unitsPerBundle: it.unitsPerBundle,
          quantity: it.quantity,
          lineTotalMnt: it.lineTotalMnt,
        }))
      );

      // Best-effort stock decrement
      for (const it of itemsForDb) {
        await tx
          .update(products)
          .set({ stock: sql`max(0, ${products.stock} - ${it.quantity * it.unitsPerBundle})` })
          .where(and(eq(products.id, it.productId)));
      }
    });

    // Fire admin email — non-blocking, never roll back on email failure
    const r = resend();
    if (r) {
      try {
        await r.emails.send({
          from: env.RESEND_FROM_EMAIL,
          to: env.ADMIN_NOTIFICATION_EMAIL,
          subject: `Шинэ захиалга #${orderNumber} · ${new Intl.NumberFormat("mn-MN").format(total)} ₮`,
          react: NewOrderAdmin({
            orderNumber,
            orderId,
            createdAtText: formatDate(new Date()),
            customer: {
              firstName: data.customer.firstName,
              lastName: data.customer.lastName || "",
              phone: data.customer.phone,
              additionalPhone: data.customer.additionalPhone || undefined,
              district: data.customer.district,
              khoroo: data.customer.khoroo || undefined,
              building: data.customer.building || undefined,
              entrance: data.customer.entrance || undefined,
              floor: data.customer.floor || undefined,
              apartment: data.customer.apartment || undefined,
              notes: data.customer.notes || undefined,
            },
            items: itemsForDb.map((it) => ({
              name: it.productName,
              variantLabel: it.variantLabel,
              imageUrl: it.imageUrl,
              unitPriceMnt: it.unitPriceMnt,
              quantity: it.quantity,
              unitsPerBundle: it.unitsPerBundle,
              lineTotalMnt: it.lineTotalMnt,
            })),
            subtotalMnt: subtotal,
            shippingMnt: shipping,
            discountMnt: discount,
            totalMnt: total,
            adminUrl: `${env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}`,
            shopName: env.NEXT_PUBLIC_SITE_NAME,
          }),
        });
      } catch (e) {
        console.error("[email] failed to send admin notification:", e);
      }
    } else {
      console.log(`[email] Skipped (no RESEND_API_KEY). Order #${orderNumber} created.`);
    }

    revalidatePath("/admin/orders");
    return { ok: true, orderId, orderNumber };
  } catch (e: unknown) {
    console.error("[createOrderAction]", e);
    return { ok: false, error: "Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу." };
  }
}
