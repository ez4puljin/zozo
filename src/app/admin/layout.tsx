import type { Metadata } from "next";
import { AdminSidebar, AdminMobileHeader } from "@/components/admin/AdminNav";
import { getShopName } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const shopName = await getShopName();
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <AdminSidebar shopName={shopName} />
        <div className="flex-1 min-w-0">
          <AdminMobileHeader shopName={shopName} />
          <main className="p-4 sm:p-6 lg:p-8 max-w-[1400px]">{children}</main>
        </div>
      </div>
    </div>
  );
}
