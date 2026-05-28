// TEMPORARY DEBUG: bypass the form and set a session cookie directly via URL.
// Visit /api/debug/login-bypass?secret=<ADMIN_SESSION_SECRET first 8 chars>
// Removes ambiguity about whether the issue is in LoginForm or middleware/cookie.
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const COOKIE = "zozo_admin_session";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secretPrefix = url.searchParams.get("secret") ?? "";
  // Simple safety check — must know first 8 chars of ADMIN_SESSION_SECRET
  if (!secretPrefix || !env.ADMIN_SESSION_SECRET.startsWith(secretPrefix) || secretPrefix.length < 8) {
    return NextResponse.json(
      {
        error: "Provide ?secret= with first 8+ chars of ADMIN_SESSION_SECRET to authorize bypass",
        hint: "This is a temporary debug endpoint; will be removed.",
      },
      { status: 403 }
    );
  }

  const SECRET = new TextEncoder().encode(env.ADMIN_SESSION_SECRET);
  const jwt = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set(COOKIE, jwt, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
