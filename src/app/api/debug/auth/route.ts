// TEMPORARY DEBUG ENDPOINT — REMOVE AFTER TROUBLESHOOTING LOGIN
// Visit /api/debug/auth?test=YOUR_PASSWORD to see if bcrypt accepts it.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const test = url.searchParams.get("test") ?? "";

  const hash = env.ADMIN_PASSWORD_HASH;
  const len = hash.length;
  const prefix = hash.slice(0, 7);
  const suffix = hash.slice(-4);
  const looksLikeBcrypt =
    hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");

  let matches: boolean | null = null;
  if (test) {
    try {
      matches = await bcrypt.compare(test, hash);
    } catch (e) {
      matches = null;
    }
  }

  return NextResponse.json({
    hash_length: len,
    hash_prefix: prefix,
    hash_suffix: suffix,
    looks_like_bcrypt: looksLikeBcrypt,
    test_password_provided: test ? "yes" : "no",
    test_password_matches: matches,
    session_secret_length: env.ADMIN_SESSION_SECRET.length,
  });
}
