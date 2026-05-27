import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./data/zozo.db"),
  DATABASE_AUTH_TOKEN: z.string().optional(),

  NEXT_PUBLIC_SITE_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SITE_NAME: z.string().default("ZoZo"),

  ADMIN_PASSWORD_HASH: z.string().min(10, "ADMIN_PASSWORD_HASH not set"),
  ADMIN_SESSION_SECRET: z.string().min(16, "ADMIN_SESSION_SECRET too short"),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().default("onboarding@resend.dev"),
  ADMIN_NOTIFICATION_EMAIL: z.string().email().default("owner@example.com"),

  BLOB_READ_WRITE_TOKEN: z.string().optional(),
  NEXT_PUBLIC_FB_PIXEL_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.format());
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
