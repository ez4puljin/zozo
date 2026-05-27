"use server";

import { verifyAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  productVariants,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { newId, slugify } from "@/lib/utils";
import { z } from "zod";

const variantInput = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Variant label заавал"),
  unitsPerBundle: z.coerce.number().int().min(1),
  priceMnt: z.coerce.number().int().min(0),
  compareAtPriceMnt: z.coerce.number().int().nullable().optional(),
  discountPercent: z.coerce.number().int().min(0).max(100).default(0),
  isDefault: z.boolean().default(false),
  position: z.coerce.number().int().default(0),
  badge: z.string().nullable().optional(),
});

const imageInput = z.object({
  id: z.string().optional(),
  url: z.string().url("Зургийн URL буруу"),
  alt: z.string().nullable().optional(),
  position: z.coerce.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

const productInput = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z.string().min(1, "Нэр заавал"),
  descriptionMd: z.string().default(""),
  howToUseMd: z.string().default(""),
  basePriceMnt: z.coerce.number().int().min(0),
  compareAtPriceMnt: z.coerce.number().int().nullable().optional(),
  discountPercent: z.coerce.number().int().min(0).max(100).default(0),
  stock: z.coerce.number().int().min(0).default(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  status: z.enum(["active", "draft"]).default("draft"),
  rating: z.coerce.number().min(0).max(5).nullable().optional(),
  ratingCount: z.coerce.number().int().min(0).default(0),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  position: z.coerce.number().int().default(0),
  variants: z.array(variantInput).min(1, "1-ээс багагүй variant"),
  images: z.array(imageInput).default([]),
});

export type ProductInput = z.infer<typeof productInput>;

export async function upsertProductAction(
  raw: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  if (!(await verifyAdminSession())) return { ok: false, error: "Эрхгүй" };

  const parsed = productInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const p = parsed.data;
  const slug = (p.slug && p.slug.trim()) || slugify(p.name);
  if (!slug) return { ok: false, error: "Slug үүсгэх боломжгүй" };

  const id = p.id ?? newId();
  const now = new Date();

  // Ensure at most one is_default in variants
  const variants = p.variants.map((v, i) => ({ ...v, position: i }));
  const hasDefault = variants.some((v) => v.isDefault);
  if (!hasDefault) variants[0].isDefault = true;

  const images = p.images.map((img, i) => ({ ...img, position: i }));

  try {
    await db.transaction(async (tx) => {
      if (p.id) {
        await tx
          .update(products)
          .set({
            slug,
            name: p.name,
            descriptionMd: p.descriptionMd,
            howToUseMd: p.howToUseMd,
            basePriceMnt: p.basePriceMnt,
            compareAtPriceMnt: p.compareAtPriceMnt ?? null,
            discountPercent: p.discountPercent,
            stock: p.stock,
            lowStockThreshold: p.lowStockThreshold,
            status: p.status,
            rating: p.rating ?? null,
            ratingCount: p.ratingCount,
            seoTitle: p.seoTitle ?? null,
            seoDescription: p.seoDescription ?? null,
            position: p.position,
            updatedAt: now,
          })
          .where(eq(products.id, id));

        await tx.delete(productImages).where(eq(productImages.productId, id));
        await tx.delete(productVariants).where(eq(productVariants.productId, id));
      } else {
        await tx.insert(products).values({
          id,
          slug,
          name: p.name,
          descriptionMd: p.descriptionMd,
          howToUseMd: p.howToUseMd,
          basePriceMnt: p.basePriceMnt,
          compareAtPriceMnt: p.compareAtPriceMnt ?? null,
          discountPercent: p.discountPercent,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          status: p.status,
          rating: p.rating ?? null,
          ratingCount: p.ratingCount,
          seoTitle: p.seoTitle ?? null,
          seoDescription: p.seoDescription ?? null,
          position: p.position,
        });
      }

      if (images.length > 0) {
        await tx.insert(productImages).values(
          images.map((img) => ({
            id: newId(),
            productId: id,
            url: img.url,
            alt: img.alt ?? null,
            position: img.position,
            isPrimary: img.isPrimary,
          }))
        );
      }

      await tx.insert(productVariants).values(
        variants.map((v) => ({
          id: newId(),
          productId: id,
          label: v.label,
          unitsPerBundle: v.unitsPerBundle,
          priceMnt: v.priceMnt,
          compareAtPriceMnt: v.compareAtPriceMnt ?? null,
          discountPercent: v.discountPercent,
          isDefault: v.isDefault,
          position: v.position,
          badge: v.badge ?? null,
        }))
      );
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("UNIQUE") && msg.includes("slug")) {
      return { ok: false, error: "Энэ slug-тай бараа аль хэдийн байна." };
    }
    return { ok: false, error: msg };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/");
  revalidatePath("/collections/all");
  return { ok: true, id };
}

export async function deleteProductAction(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await verifyAdminSession())) return { ok: false, error: "Эрхгүй" };
  try {
    await db.delete(products).where(eq(products.id, id));
  } catch (e: unknown) {
    return {
      ok: false,
      error:
        "Энэ бараа захиалгад орсон бол устгах боломжгүй. Үүний оронд статусыг 'draft' болгоно уу.",
    };
  }
  revalidatePath("/admin/products");
  return { ok: true };
}
