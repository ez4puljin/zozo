import { db } from "@/lib/db";
import { settings, type Settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env";

/** Read the singleton settings row (id=1). Returns null on any failure. */
export async function getSettings(): Promise<Settings | null> {
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, 1));
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** Brand/shop name with sensible fallback to the env default. */
export async function getShopName(): Promise<string> {
  const cfg = await getSettings();
  return cfg?.shopName?.trim() || env.NEXT_PUBLIC_SITE_NAME;
}
