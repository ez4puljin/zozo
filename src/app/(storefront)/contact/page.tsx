import type { Metadata } from "next";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Mail, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Холбоо барих",
  description: "Бидэнтэй холбогдох мэдээлэл.",
};

export default async function ContactPage() {
  const cfg = (await db.select().from(settings).where(eq(settings.id, 1)))[0];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <header className="text-center">
        <div className="zz-eyebrow zz-eyebrow-hero mb-3">Бидэнтэй холбогдох</div>
        <h1
          className="font-bold leading-tight"
          style={{
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            letterSpacing: "-0.025em",
          }}
        >
          Холбоо барих
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Захиалга, бараа, ерөнхий асуултын талаар манайхтай холбогдоорой.
        </p>
      </header>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {cfg?.shopPhone ? (
          <a
            href={`tel:${cfg.shopPhone}`}
            className="flex flex-col items-center gap-3 rounded-lg border p-8 hover:bg-muted transition"
          >
            <Phone className="h-6 w-6" />
            <div className="text-sm font-semibold">Утас</div>
            <div className="text-base">{cfg.shopPhone}</div>
          </a>
        ) : null}
        {cfg?.shopEmail ? (
          <a
            href={`mailto:${cfg.shopEmail}`}
            className="flex flex-col items-center gap-3 rounded-lg border p-8 hover:bg-muted transition"
          >
            <Mail className="h-6 w-6" />
            <div className="text-sm font-semibold">И-мэйл</div>
            <div className="text-base">{cfg.shopEmail}</div>
          </a>
        ) : null}
      </div>
    </section>
  );
}
