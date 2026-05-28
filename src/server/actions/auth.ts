"use server";

import { verifyAdminPassword, setAdminSession, clearAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Verify password, set session cookie, then redirect.
 * Doing the redirect on the server (instead of client router.replace) ensures
 * the cookie is included in the very next request and the middleware sees it.
 */
export async function loginAction(
  password: string,
  from: string = "/admin"
): Promise<{ ok: false; error: string } | never> {
  // Only allow internal redirect targets
  const safeFrom = from.startsWith("/") && !from.startsWith("//") ? from : "/admin";

  if (await verifyAdminPassword(password)) {
    await setAdminSession();
    redirect(safeFrom);
  }
  return { ok: false, error: "Нууц үг буруу байна." };
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
