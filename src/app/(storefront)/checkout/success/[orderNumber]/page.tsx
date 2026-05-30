import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { formatDate, formatMNT } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Захиалга амжилттай",
  robots: { index: false },
};

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export default async function SuccessPage({ params }: Props) {
  const { orderNumber } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  return (
    <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Захиалга амжилттай!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Захиалгын дугаар: <span className="font-mono font-semibold">#{order.orderNumber}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(order.createdAt)}
        </p>
      </div>

      <div className="mt-10 rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold">Захиалсан бараа</h2>
        <ul className="space-y-3 divide-y">
          {items.map((it) => (
            <li key={it.id} className="flex gap-3 pt-3 first:pt-0">
              {it.productImageSnapshot ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={it.productImageSnapshot}
                    alt={it.productNameSnapshot}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
              ) : null}
              <div className="flex-1">
                <div className="text-sm font-medium">{it.productNameSnapshot}</div>
                <div className="text-xs text-muted-foreground">
                  {it.variantLabelSnapshot} × {it.quantity}
                </div>
              </div>
              <div className="text-sm font-semibold">{formatMNT(it.lineTotalMnt)}</div>
            </li>
          ))}
        </ul>

        <div className="border-t pt-3 space-y-1 text-sm">
          {order.discountMnt > 0 ? (
            <div className="flex justify-between text-success">
              <span>Хэмнэлт</span>
              <span>-{formatMNT(order.discountMnt)}</span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Хүргэлт</span>
            <span className="uppercase font-medium">Үнэгүй</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-semibold">Нийт</span>
            <span className="font-bold">{formatMNT(order.totalMnt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border p-6 text-sm">
        <h3 className="font-semibold mb-2">Дараагийн алхам</h3>
        <p className="text-muted-foreground leading-relaxed">
          Манай ажилтан таны утсаар ({order.phone}) удахгүй холбогдож захиалгыг
          баталгаажуулна. Хүргэлтийн ажилтан барааг авахдаа төлбөрийг бэлэн мөнгөөр авна.
        </p>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/collections/all"
          className="inline-flex rounded-full border px-6 py-3 text-sm font-medium hover:bg-muted transition"
        >
          Үргэлжлүүлэн худалдаа хийх
        </Link>
      </div>
    </section>
  );
}
