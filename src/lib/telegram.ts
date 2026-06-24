import { env } from "@/lib/env";

/** Escape text for Telegram HTML parse_mode. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Send an HTML message to the configured Telegram chat(s).
 * TELEGRAM_CHAT_ID may be a single id or a comma-separated list.
 * Returns true if at least one send succeeded. Never throws.
 */
export async function sendTelegramMessage(html: string): Promise<boolean> {
  const token = env.TELEGRAM_BOT_TOKEN;
  const chatIds = (env.TELEGRAM_CHAT_ID ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!token || chatIds.length === 0) return false;

  let anyOk = false;
  for (const chatId of chatIds) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: html,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        anyOk = true;
      } else {
        const body = await res.text().catch(() => "");
        console.error(`[telegram] sendMessage failed (${res.status}) for ${chatId}: ${body}`);
      }
    } catch (e) {
      console.error("[telegram] send error:", e);
    }
  }
  return anyOk;
}
