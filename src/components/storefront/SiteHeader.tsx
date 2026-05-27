import Link from "next/link";
import { env } from "@/lib/env";
import { CartIconBadge } from "./CartIconBadge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:opacity-70 transition">
            Нүүр
          </Link>
          <Link href="/collections/all" className="hover:opacity-70 transition">
            Бараа
          </Link>
          <Link href="/contact" className="hover:opacity-70 transition hidden sm:inline">
            Холбоо барих
          </Link>
        </nav>

        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
          aria-label={env.NEXT_PUBLIC_SITE_NAME}
        >
          {env.NEXT_PUBLIC_SITE_NAME}
        </Link>

        <div className="flex items-center">
          <CartIconBadge />
        </div>
      </div>
    </header>
  );
}
