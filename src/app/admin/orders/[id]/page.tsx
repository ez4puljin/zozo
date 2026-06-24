import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { orders, orderItems, orderStatusLabel } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { formatDate, formatMNT, formatPhone, fullName } from "@/lib/utils";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { OrderInternalNotes } from "@/components/admin/OrderInternalNotes";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Phone, MapPin, CreditCard, Package, MessageSquare, Copy } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetail({ params }: Props) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  const unitCount = items.reduce((sum, it) => sum + it.unitsPerBundle * it.quantity, 0);

  const fullAddress = [order.building, order.entrance, order.floor, order.apartment]
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <AdminPageHeader
        title={`#${order.orderNumber}`}
        description={`${formatDate(order.createdAt)} · ${items.length} төрөл · ${unitCount} ширхэг`}
        breadcrumbs={[
          { label: "Хяналт", href: "/admin" },
          { label: "Захиалга", href: "/admin/orders" },
          { label: `#${order.orderNumber}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Төлөв:</span>
            <OrderStatusSelect orderId={order.id} current={order.status} />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Items */}
          <section className="rounded-xl border bg-background">
            <header className="flex items-center justify-between px-5 py-3.5 border-b">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" /> Захиалсан бараа
              </h2>
              <StatusBadge status={order.status} size="sm" />
            </header>
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.id} className="flex gap-3 px-5 py-3">
                  {it.productImageSnapshot ? (
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={it.productImageSnapshot}
                        alt={it.productNameSnapshot}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {it.productNameSnapshot}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {it.variantLabelSnapshot} × {it.quantity}
                      {it.unitsPerBundle > 1
                        ? ` (нийт ${it.quantity * it.unitsPerBundle} ширхэг)`
                        : ""}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                      {formatMNT(it.unitPriceMnt)} / нэгж
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums shrink-0">
                    {formatMNT(it.lineTotalMnt)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t px-5 py-4 space-y-1.5 text-sm">
              <Row label="Дэд дүн" value={formatMNT(order.subtotalMnt)} />
              {order.discountMnt > 0 ? (
                <Row label="Хэмнэлт" value={`-${formatMNT(order.discountMnt)}`} success />
              ) : null}
              <Row
                label="Хүргэлт"
                value={order.shippingMnt > 0 ? formatMNT(order.shippingMnt) : "ҮНЭГҮЙ"}
              />
              <div className="flex items-baseline justify-between border-t pt-3 mt-2">
                <span className="font-semibold">Нийт</span>
                <span className="text-xl font-bold tabular-nums">
                  {formatMNT(order.totalMnt)}
                </span>
              </div>
            </div>
          </section>

          {/* Internal notes */}
          <section className="rounded-xl border bg-background">
            <header className="px-5 py-3.5 border-b">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> Дотоод тэмдэглэл
                <span className="text-[11px] font-normal text-muted-foreground">
                  (зөвхөн админд харагдана)
                </span>
              </h2>
            </header>
            <div className="px-5 py-4">
              <OrderInternalNotes orderId={order.id} initial={order.internalNotes} />
            </div>
          </section>
        </div>

        {/* Sidebar — sticky customer info on desktop */}
        <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {/* Call CTA card */}
          <section className="rounded-xl border bg-background overflow-hidden">
            <header className="px-5 py-3.5 border-b">
              <h2 className="text-sm font-semibold">Хэрэглэгч</h2>
            </header>
            <div className="px-5 py-4 space-y-3">
              <div>
                <div className="text-xs text-muted-foreground">Хүлээн авагч</div>
                <div className="font-semibold text-sm mt-0.5">
                  {fullName(order.firstName, order.lastName)}
                </div>
              </div>
              <a
                href={`tel:${order.phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-md bg-foreground text-background px-4 py-3 text-sm font-semibold hover:opacity-90 transition active:scale-[0.99]"
              >
                <Phone className="h-4 w-4" />
                Залгах · {formatPhone(order.phone)}
              </a>
              {order.additionalPhone ? (
                <a
                  href={`tel:${order.additionalPhone}`}
                  className="flex items-center justify-center gap-1.5 w-full rounded-md border px-4 py-2 text-xs text-muted-foreground hover:bg-muted transition"
                >
                  <Phone className="h-3 w-3" />
                  Нэмэлт: {formatPhone(order.additionalPhone)}
                </a>
              ) : null}
            </div>
          </section>

          {/* Address */}
          <section className="rounded-xl border bg-background overflow-hidden">
            <header className="px-5 py-3.5 border-b flex items-center justify-between">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Хүргэлтийн хаяг
              </h2>
            </header>
            <div className="px-5 py-4 text-sm">
              <div className="font-medium">{order.district}</div>
              {order.khoroo ? (
                <div className="text-muted-foreground mt-1">{order.khoroo}</div>
              ) : null}
              {fullAddress ? (
                <div className="text-muted-foreground mt-1">{fullAddress}</div>
              ) : null}
              {order.notes ? (
                <div className="mt-3 rounded-md bg-muted/40 p-2.5 text-xs italic">
                  💬 {order.notes}
                </div>
              ) : null}
            </div>
          </section>

          {/* Payment & status */}
          <section className="rounded-xl border bg-background overflow-hidden">
            <header className="px-5 py-3.5 border-b">
              <h2 className="text-sm font-semibold flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" /> Төлбөр ба төлөв
              </h2>
            </header>
            <div className="px-5 py-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Төлбөрийн арга</span>
                <span className="font-semibold uppercase tracking-wider text-xs">
                  Авахдаа төлөх
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Одоогийн төлөв</span>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Үүсгэсэн</span>
                <span className="text-xs tabular-nums">{formatDate(order.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">Шинэчилсэн</span>
                <span className="text-xs tabular-nums">{formatDate(order.updatedAt)}</span>
              </div>
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
      <span className={success ? "text-success font-semibold tabular-nums" : "tabular-nums"}>
        {value}
      </span>
    </div>
  );
}
