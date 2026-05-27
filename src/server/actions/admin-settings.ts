"use server";

import { verifyAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  promoBannerText: z.string().max(200).default(""),
  promoBannerEnabled: z.boolean().default(true),
  announcementMd: z.string().max(2000).nullable().optional(),
  shopPhone: z.string().max(40).nullable().optional(),
  shopEmail: z.string().max(80).nullable().optional(),
});

export async function updateSettingsAction(
  raw: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await verifyAdminSession())) return { ok: false, error: "Эрхгүй" };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
  }
  const v = parsed.data;
  await db
    .insert(settings)
    .values({
      id: 1,
      promoBannerText: v.promoBannerText,
      promoBannerEnabled: v.promoBannerEnabled,
      announcementMd: v.announcementMd ?? null,
      shopPhone: v.shopPhone ?? null,
      shopEmail: v.shopEmail ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: {
        promoBannerText: v.promoBannerText,
        promoBannerEnabled: v.promoBannerEnabled,
        announcementMd: v.announcementMd ?? null,
        shopPhone: v.shopPhone ?? null,
        shopEmail: v.shopEmail ?? null,
        updatedAt: new Date(),
      },
    });
  revalidatePath("/");
  revalidatePath("/contact");
  return { ok: true };
}
