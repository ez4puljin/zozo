import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { getShopName } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Admin нэвтрэх",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const shopName = await getShopName();
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-2xl font-bold tracking-tight">{shopName} Admin</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Дэлгүүрийн удирдлагын самбарт нэвтрэнэ үү.
            </p>
          </div>
          <div className="rounded-xl border bg-background p-6 shadow-sm">
            <Suspense
              fallback={
                <div className="text-sm text-muted-foreground py-2">Уншиж байна…</div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Анхааруулга: энэ хуудас нь зөвхөн админ хэрэглэгчид зориулагдсан.
          </p>
        </div>
      </div>
    </div>
  );
}
