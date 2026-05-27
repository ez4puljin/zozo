import Link from "next/link";
import type { Metadata } from "next";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { LayoutDashboard, Package, ShoppingBag, Settings as SettingsIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r bg-background min-h-screen sticky top-0">
          <div className="px-6 py-6">
            <div className="text-lg font-bold">ZoZo Admin</div>
            <Link href="/" className="text-xs text-muted-foreground hover:underline">
              Дэлгүүр →
            </Link>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            <AdminNavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
              Хяналт
            </AdminNavLink>
            <AdminNavLink href="/admin/orders" icon={<ShoppingBag className="h-4 w-4" />}>
              Захиалга
            </AdminNavLink>
            <AdminNavLink href="/admin/products" icon={<Package className="h-4 w-4" />}>
              Бараа
            </AdminNavLink>
            <AdminNavLink href="/admin/settings" icon={<SettingsIcon className="h-4 w-4" />}>
              Тохиргоо
            </AdminNavLink>
          </nav>
          <div className="px-3 py-4 border-t">
            <LogoutButton />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="lg:hidden flex items-center justify-between border-b bg-background px-4 py-3">
            <Link href="/admin" className="font-bold">
              ZoZo Admin
            </Link>
            <div className="flex items-center gap-3 text-xs">
              <Link href="/admin/orders">Захиалга</Link>
              <Link href="/admin/products">Бараа</Link>
              <Link href="/admin/settings">Тохиргоо</Link>
              <LogoutButton compact />
            </div>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
