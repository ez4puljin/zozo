import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusLabel } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { formatDate, formatMNT, formatPhone } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderInternalNotes } from "@/components/admin/OrderInternalNotes";
import { Phone, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetail({ params }: Props) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Захиалга
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">#{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Төлөв:</span>
          <OrderStatusSelect orderId={order.id} current={order.status} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-sm font-semibold mb-3">Захиалсан бараа</h2>
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 py-3 first:pt-0">
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
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {it.variantLabelSnapshot} × {it.quantity}
                      {it.unitsPerBundle > 1
                        ? ` (нийт ${it.quantity * it.unitsPerBundle} ширхэг)`
                        : ""}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Нэгж: {formatMNT(it.unitPriceMnt)}
                    </div>
                  </div>
                  <div className="text-sm font-semibold">{formatMNT(it.lineTotalMnt)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 border-t pt-3 text-sm">
              <Row label="Дэд дүн" value={formatMNT(order.subtotalMnt)} />
              {order.discountMnt > 0 ? (
                <Row label="Хэмнэлт" value={`-${formatMNT(order.discountMnt)}`} success />
              ) : null}
              <Row
                label="Хүргэлт"
                value={order.shippingMnt > 0 ? formatMNT(order.shippingMnt) : "ҮНЭГҮЙ"}
              />
              <div className="flex items-baseline justify-between border-t pt-2">
                <span className="font-semibold">Нийт</span>
                <span className="text-lg font-bold">{formatMNT(order.totalMnt)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-sm font-semibold mb-2">Дотоод тэмдэглэл (зөвхөн админд)</h2>
            <OrderInternalNotes orderId={order.id} initial={order.internalNotes} />
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-sm font-semibold mb-3">Хэрэглэгч</h2>
            <div className="text-sm">
              <div className="font-medium">
                {order.lastName} {order.firstName}
              </div>
              <a
                href={`tel:${order.phone}`}
                className="mt-2 inline-flex items-center gap-2 rounded-md bg-foreground text-background px-3 py-2 text-xs font-semibold hover:opacity-90"
              >
                <Phone className="h-3.5 w-3.5" />
                Залгах: {formatPhone(order.phone)}
              </a>
              {order.additionalPhone ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  Нэмэлт: <a href={`tel:${order.additionalPhone}`}>{formatPhone(order.additionalPhone)}</a>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border bg-background p-5">
            <h2 className="text-sm font-semibold mb-3">Хүргэлтийн хаяг</h2>
            <div className="text-sm leading-relaxed text-muted-foreground">
              <div className="text-foreground">{order.district}</div>
              {order.khoroo ? <div>{order.khoroo}</div> : null}
              {[order.building, order.entrance, order.floor, order.apartment]
                .filter(Boolean)
                .join(", ") || ""}
              {order.notes ? (
                <div className="mt-2 italic">Тэмдэглэл: {order.notes}</div>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border bg-background p-5 text-sm">
            <h2 className="font-semibold mb-2">Төлбөр</h2>
            <div className="text-muted-foreground">АВАХДАА ТӨЛӨХ</div>
            <div className="mt-3 text-xs text-muted-foreground">
              Төлөв: {orderStatusLabel[order.status]}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, success }: { label: string; value: string; success?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={success ? "text-success font-semibold" : ""}>{value}</span>
    </div>
  );
}
