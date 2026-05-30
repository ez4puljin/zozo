"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Package, ShoppingBag, Settings as SettingsIcon, Menu, X, ExternalLink } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Хяналт", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Захиалга", icon: ShoppingBag },
  { href: "/admin/products", label: "Бараа", icon: Package },
  { href: "/admin/settings", label: "Тохиргоо", icon: SettingsIcon },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 border-r bg-background min-h-screen sticky top-0">
      <div className="px-6 py-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          ZoZo <span className="text-muted-foreground font-normal">Admin</span>
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
        >
          Дэлгүүр харах <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/80 hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t">
        <LogoutButton />
      </div>
    </aside>
  );
}

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 backdrop-blur px-4 py-3">
        <button
          onClick={() => setOpen(true)}
          aria-label="Меню нээх"
          className="rounded-md p-2 -ml-2 hover:bg-muted transition"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/admin" className="font-bold tracking-tight">
          ZoZo Admin
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          aria-label="Дэлгүүр харах"
          className="rounded-md p-2 -mr-2 hover:bg-muted transition"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </header>

      {/* Mobile drawer */}
      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={cn(
          "lg:hidden fixed inset-0 z-50 bg-foreground/40 transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />
      <aside
        className={cn(
          "lg:hidden fixed top-0 left-0 z-50 h-dvh w-64 bg-background shadow-xl flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <Link href="/admin" onClick={() => setOpen(false)} className="font-bold">
            ZoZo Admin
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Хаах"
            className="rounded-md p-1.5 hover:bg-muted transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
