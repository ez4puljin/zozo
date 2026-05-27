"use server";

import { verifyAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderStatus, type OrderStatus } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await verifyAdminSession())) return { ok: false, error: "Эрхгүй" };
  if (!orderStatus.includes(status)) return { ok: false, error: "Буруу төлөв" };

  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateInternalNotesAction(
  orderId: string,
  notes: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await verifyAdminSession())) return { ok: false, error: "Эрхгүй" };
  await db
    .update(orders)
    .set({ internalNotes: notes ?? "", updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
