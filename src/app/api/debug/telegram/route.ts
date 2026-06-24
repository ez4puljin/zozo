// TEMPORARY DEBUG — confirm Telegram env is present in the production runtime.
// GET /api/debug/telegram?secret=<first 8+ chars of ADMIN_SESSION_SECRET>
// Returns whether the env vars are set and tries to send a test message.
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret") ?? "";
  if (!secret || !env.ADMIN_SESSION_SECRET.startsWith(secret) || secret.length < 8) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  const hasToken = !!env.TELEGRAM_BOT_TOKEN;
  const hasChatId = !!env.TELEGRAM_CHAT_ID;
  let sent: boolean | null = null;
  if (hasToken && hasChatId) {
    sent = await sendTelegramMessage(
      "🔧 <b>ZoZo</b> — production runtime-аас туршилтын мессеж. Энэ ирвэл захиалгын мэдэгдэл ажиллана."
    );
  }

  return NextResponse.json(
    {
      hasToken,
      hasChatId,
      chatIdPreview: env.TELEGRAM_CHAT_ID
        ? env.TELEGRAM_CHAT_ID.slice(0, 4) + "…"
        : null,
      testMessageSent: sent,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
