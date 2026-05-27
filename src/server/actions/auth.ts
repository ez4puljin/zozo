"use server";

import { verifyAdminPassword, setAdminSession, clearAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (await verifyAdminPassword(password)) {
    await setAdminSession();
    return { ok: true };
  }
  return { ok: false, error: "Нууц үг буруу байна." };
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
