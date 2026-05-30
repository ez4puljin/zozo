import Link from "next/link";
import { db } from "@/lib/db";
import {
  orders,
  orderStatusLabel,
  type OrderStatus,
  orderStatus,
} from "@/lib/schema";
import { desc, eq, like, or, and, sql } from "drizzle-orm";
import { formatDate, formatMNT, formatPhone } from "@/lib/utils";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { ShoppingBag, Search, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

async function getStatusCounts() {
  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .groupBy(orders.status);
  const map = new Map<OrderStatus, number>();
  for (const r of rows) map.set(r.status, r.count);
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return { byStatus: map, total };
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = (
    orderStatus.includes(sp.status as OrderStatus) ? sp.status : undefined
  ) as OrderStatus | undefined;
  const q = sp.q?.trim();

  const conditions = [];
  if (status) conditions.push(eq(orders.status, status));
  if (q) {
    conditions.push(
      or(
        like(orders.phone, `%${q}%`),
        like(orders.orderNumber, `%${q}%`),
        like(orders.firstName, `%${q}%`),
        like(orders.lastName, `%${q}%`)
      )
    );
  }

  const whereClause =
    conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions);

  const [list, counts] = await Promise.all([
    db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt)).limit(200),
    getStatusCounts(),
  ]);

  return (
    <div>
      <AdminPageHeader
        title="Захиалга"
        description={`Нийт ${counts.total} захиалга, ${list.length} харагдаж байна.`}
        breadcrumbs={[{ label: "Хяналт", href: "/admin" }, { label: "Захиалга" }]}
      />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <StatusChip current={status} value={undefined} label="Бүгд" count={counts.total} />
        {orderStatus.map((s) => (
          <StatusChip
            key={s}
            current={status}
            value={s}
            label={orderStatusLabel[s]}
            count={counts.byStatus.get(s) ?? 0}
          />
        ))}
      </div>

      {/* Search */}
      <form className="flex items-center gap-2 mb-4" action="">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Утас, нэр эсвэл захиалгын дугаараар хайх"
            className="block w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
          />
        </div>
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button
          type="submit"
          className="rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
        >
          Хайх
        </button>
        {q ? (
          <Link
            href={status ? `?status=${status}` : "?"}
            className="rounded-md border px-3 py-2 text-xs font-medium hover:bg-muted"
          >
            Цэвэрлэх
          </Link>
        ) : null}
      </form>

      {/* Table */}
      <div className="rounded-xl border bg-background overflow-hidden">
        {list.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Захиалга олдсонгүй"
            description={
              q
                ? `"${q}" нэртэй илэрц байхгүй. Өөр түлхүүр үг туршина уу.`
                : status
                ? `${orderStatusLabel[status]} төлөвт захиалга алга.`
                : "Шинэ захиалга үүсэхэд энд харагдана."
            }
            className="border-0"
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">№</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Огноо</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Хүлээн авагч</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Утас</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Дүн</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-medium hover:underline tabular-nums"
                      >
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {o.lastName} {o.firstName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {o.district}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:${o.phone}`}
                        className="inline-flex items-center gap-1 font-medium hover:underline tabular-nums"
                      >
                        <Phone className="h-3 w-3" />
                        {formatPhone(o.phone)}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatMNT(o.totalMnt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y">
              {list.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex flex-col gap-1.5 px-4 py-3 hover:bg-muted/30 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">#{o.orderNumber}</span>
                      <StatusBadge status={o.status} size="xs" />
                    </div>
                    <div className="text-sm">
                      {o.lastName} {o.firstName}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatPhone(o.phone)} · {formatDate(o.createdAt)}</span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {formatMNT(o.totalMnt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function StatusChip({
  current,
  value,
  label,
  count,
}: {
  current: OrderStatus | undefined;
  value: OrderStatus | undefined;
  label: string;
  count: number;
}) {
  const isActive = current === value;
  const href = value ? `?status=${value}` : "?";
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        isActive ? "bg-foreground text-background border-foreground" : "hover:bg-muted"
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
          isActive ? "bg-background/20" : "bg-muted text-foreground"
        )}
      >
        {count}
      </span>
    </Link>
  );
}
