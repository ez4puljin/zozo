import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { env } from "./env";

const COOKIE_NAME = "zozo_admin_session";
const SESSION_DURATION_S = 60 * 60 * 24 * 7; // 7 days
const SECRET = new TextEncoder().encode(env.ADMIN_SESSION_SECRET);

interface SessionPayload {
  admin: true;
  iat: number;
  exp: number;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  try {
    return await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH);
  } catch {
    return false;
  }
}

export async function createAdminSessionCookie(): Promise<string> {
  const jwt = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_S}s`)
    .sign(SECRET);
  return jwt;
}

export async function setAdminSession() {
  const token = await createAdminSessionCookie();
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_S,
  });
}

export async function clearAdminSession() {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function verifyAdminSession(): Promise<boolean> {
  const c = await cookies();
  const token = c.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as unknown as SessionPayload).admin === true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME };

// Edge-compatible (Web Crypto only) — for use in middleware
export async function verifyAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload as unknown as SessionPayload).admin === true;
  } catch {
    return false;
  }
}
