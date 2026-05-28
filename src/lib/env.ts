import { z } from "zod";

// Normalize a URL-like string: add https:// if missing, strip trailing slash.
function normalizeUrl(input: string | undefined): string {
  const raw = (input ?? "").trim();
  if (!raw) return "http://localhost:3000";
  // If already has a protocol, leave it; else prepend https://
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

const SITE_URL = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);
// Validate it parses; if not, fall back to localhost. Prevents build crash if
// someone enters a malformed URL in the Vercel dashboard.
let safeSiteUrl: string;
try {
  new URL(SITE_URL);
  safeSiteUrl = SITE_URL;
} catch {
  console.warn(
    `⚠️ NEXT_PUBLIC_SITE_URL ("${process.env.NEXT_PUBLIC_SITE_URL}") is invalid. Falling back to http://localhost:3000`
  );
  safeSiteUrl = "http://localhost:3000";
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("file:./data/zozo.db"),
  DATABASE_AUTH_TOKEN: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().default(safeSiteUrl),
  NEXT_PUBLIC_SITE_NAME: z.string().default("ZoZo"),

  ADMIN_PASSWORD_HASH: z.string().min(10, "ADMIN_PASSWORD_HASH not set"),
  ADMIN_SESSION_SECRET: z.string().min(16, "ADMIN_SESSION_SECRET too short"),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("onboarding@resend.dev"),
  ADMIN_NOTIFICATION_EMAIL: z
    .string()
    .email()
    .or(z.literal(""))
    .default("owner@example.com")
    .transform((v) => v || "owner@example.com"),

  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),
});

// Use normalized SITE_URL instead of the raw env value
const sourceEnv = { ...process.env, NEXT_PUBLIC_SITE_URL: safeSiteUrl };
const parsed = envSchema.safeParse(sourceEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
