// Edge-runtime-safe auth helpers (no Node APIs).
// Only used by middleware.ts to verify the session JWT.
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.ADMIN_SESSION_SECRET ?? "");
export const ADMIN_COOKIE_NAME = "zozo_admin_session";

interface SessionPayload {
  admin: true;
  iat: number;
  exp: number;
}

export async function verifyAdminSessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;
  if (!process.env.ADMIN_SESSION_SECRET) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as unknown as SessionPayload).admin === true;
  } catch {
    return false;
  }
}
