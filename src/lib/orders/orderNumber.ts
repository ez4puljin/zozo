import { db } from "@/lib/db";
import { dailyCounter } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Generate next order number for today in format ZZ-YYMMDD-NNNN.
 * Uses a per-day counter row to avoid scanning the whole orders table.
 */
export async function nextOrderNumber(): Promise<string> {
  const now = new Date();
  // Asia/Ulaanbaatar offset is fixed +08:00, no DST
  const ulaanbaatar = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const yy = String(ulaanbaatar.getUTCFullYear()).slice(2);
  const mm = String(ulaanbaatar.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(ulaanbaatar.getUTCDate()).padStart(2, "0");
  const dayKey = `${yy}${mm}${dd}`;

  // Try to atomically increment via upsert
  await db
    .insert(dailyCounter)
    .values({ dayKey, lastSeq: 1 })
    .onConflictDoUpdate({
      target: dailyCounter.dayKey,
      set: { lastSeq: sql`${dailyCounter.lastSeq} + 1` },
    });

  const [row] = await db
    .select()
    .from(dailyCounter)
    .where(eq(dailyCounter.dayKey, dayKey));

  const seq = String(row?.lastSeq ?? 1).padStart(4, "0");
  return `ZZ-${dayKey}-${seq}`;
}
