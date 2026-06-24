// Helper to set up Telegram order notifications.
//
//   1) Create a bot: open Telegram → @BotFather → /newbot → copy the TOKEN
//   2) Send any message to your new bot (or add it to a group and post there)
//   3) Run:  TELEGRAM_BOT_TOKEN=123:abc npx tsx scripts/telegram-setup.ts
//      → prints the chat_id(s) of whoever recently messaged the bot
//   4) Put TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in .env.local (and Vercel)
//      then re-run with both set to send a test message.
import "dotenv/config";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

async function main() {
  if (!token) {
    console.error("\n❌ TELEGRAM_BOT_TOKEN тохируулаагүй байна.");
    console.error("   @BotFather-аас token авч дараах байдлаар ажиллуулна уу:");
    console.error('   $env:TELEGRAM_BOT_TOKEN="123:abc"; npx tsx scripts/telegram-setup.ts\n');
    process.exit(1);
  }

  // Show who messaged the bot → their chat_id
  console.log("\n→ getUpdates татаж байна...\n");
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
  const data = (await res.json()) as {
    ok: boolean;
    result?: Array<{ message?: { chat?: { id: number; type: string; title?: string; first_name?: string; username?: string } } }>;
  };

  if (!data.ok) {
    console.error("❌ Token буруу байж магадгүй. Хариу:", JSON.stringify(data));
    process.exit(1);
  }

  const chats = new Map<number, string>();
  for (const u of data.result ?? []) {
    const c = u.message?.chat;
    if (c) {
      const label = c.title ?? [c.first_name, c.username && `@${c.username}`].filter(Boolean).join(" ");
      chats.set(c.id, `${c.type} · ${label}`);
    }
  }

  if (chats.size === 0) {
    console.log("Сүүлийн мессеж олдсонгүй. Бот руугаа ямар нэг мессеж бичээд дахин ажиллуулна уу.\n");
  } else {
    console.log("Илэрсэн chat_id-ууд:");
    for (const [id, label] of chats) console.log(`   ${id}   (${label})`);
    console.log("\n→ Эдгээрийн нэгийг TELEGRAM_CHAT_ID болгож тохируулна уу.\n");
  }

  // If chat id is provided, send a test message
  if (chatId) {
    console.log(`→ ${chatId} руу туршилтын мессеж илгээж байна...`);
    const send = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "✅ <b>ZoZo</b> — Telegram мэдэгдэл амжилттай холбогдлоо.\nОдоо захиалга бүр энд ирнэ.",
        parse_mode: "HTML",
      }),
    });
    const sj = await send.json();
    console.log(send.ok ? "✓ Илгээлээ! Telegram-аа шалгана уу.\n" : `❌ Алдаа: ${JSON.stringify(sj)}\n`);
  }

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
