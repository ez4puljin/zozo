import Link from "next/link";
import { env } from "@/lib/env";

export function SiteFooter() {
  return (
    <footer className="border-t mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <div className="text-lg font-bold">{env.NEXT_PUBLIC_SITE_NAME}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Чанарын баталгаатай бараа, шуурхай хүргэлт.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold">Холбоосууд</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition">
                  Нүүр
                </Link>
              </li>
              <li>
                <Link href="/collections/all" className="hover:text-foreground transition">
                  Бараа
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition">
                  Холбоо барих
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Худалдан авах</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Шуурхай хүргэлт — Үнэгүй</li>
              <li>Төлбөр — Авахдаа төлөх</li>
              <li>Чанарын баталгаатай</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {env.NEXT_PUBLIC_SITE_NAME}. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}
