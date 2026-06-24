import { PromoBanner } from "@/components/storefront/PromoBanner";
import { SiteHeader } from "@/components/storefront/SiteHeader";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

async function getSettings() {
  try {
    const rows = await db.select().from(settings).where(eq(settings.id, 1));
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cfg = await getSettings();
  const shopName = cfg?.shopName?.trim() || "ZoZo";
  return (
    <>
      {cfg?.promoBannerEnabled && cfg.promoBannerText ? (
        <PromoBanner text={cfg.promoBannerText} />
      ) : null}
      <SiteHeader shopName={shopName} />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter shopName={shopName} />
      <CartDrawer />
    </>
  );
}
