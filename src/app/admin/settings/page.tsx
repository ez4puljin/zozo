import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [s] = await db.select().from(settings).where(eq(settings.id, 1));

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Тохиргоо</h1>
      <p className="text-sm text-muted-foreground">
        Үндсэн banner, дэлгүүрийн холбоо барих мэдээлэл.
      </p>
      <SettingsForm
        initial={{
          promoBannerText: s?.promoBannerText ?? "Чанарын баталгаатай | Шуурхай хүргэлт",
          promoBannerEnabled: s?.promoBannerEnabled ?? true,
          announcementMd: s?.announcementMd ?? null,
          shopPhone: s?.shopPhone ?? null,
          shopEmail: s?.shopEmail ?? null,
        }}
      />
    </div>
  );
}
