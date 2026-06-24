import Link from "next/link";
import { CartIconBadge } from "./CartIconBadge";

export function SiteHeader({ shopName = "ZoZo" }: { shopName?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" style={{ height: 72 }}>
        <nav className="flex items-center gap-7 text-sm font-medium">
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
          className="text-[22px] font-bold"
          style={{ letterSpacing: "-0.04em" }}
          aria-label={shopName}
        >
          {shopName}
        </Link>

        <div className="flex items-center">
          <CartIconBadge />
        </div>
      </div>
    </header>
  );
}
