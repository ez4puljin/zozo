import Link from "next/link";
import { db } from "@/lib/db";
import { orders, orderStatusLabel, type OrderStatus, orderStatus } from "@/lib/schema";
import { desc, eq, like, or, and } from "drizzle-orm";
import { formatDate, formatMNT } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const status = (orderStatus.includes(sp.status as OrderStatus) ? sp.status : undefined) as
    | OrderStatus
    | undefined;
  const q = sp.q?.trim();

  const conditions = [];
  if (status) conditions.push(eq(orders.status, status));
  if (q) conditions.push(or(like(orders.phone, `%${q}%`), like(orders.orderNumber, `%${q}%`)));

  const whereClause =
    conditions.length === 0 ? undefined : conditions.length === 1 ? conditions[0] : and(...conditions);

  const list = await db
    .select()
    .from(orders)
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(200);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">Захиалга</h1>
        <p className="text-sm text-muted-foreground">Бүгд: {list.length}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <StatusChip current={status} value={undefined} label="Бүгд" />
        {orderStatus.map((s) => (
          <StatusChip key={s} current={status} value={s} label={orderStatusLabel[s]} />
        ))}
      </div>

      <form className="flex items-center gap-2" action="">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Утас эсвэл захиалгын дугаараар хайх"
          className="block w-full max-w-xs rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
        />
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <button type="submit" className="rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background">
          Хайх
        </button>
      </form>

      <div className="rounded-lg border bg-background overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Захиалга олдсонгүй.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">№</th>
                <th className="text-left px-4 py-2">Огноо</th>
                <th className="text-left px-4 py-2">Утас</th>
                <th className="text-left px-4 py-2 hidden sm:table-cell">Хүлээн авагч</th>
                <th className="text-right px-4 py-2">Дүн</th>
                <th className="text-left px-4 py-2">Төлөв</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((o) => (
                <tr key={o.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      #{o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <a href={`tel:${o.phone}`} className="font-medium hover:underline">
                      {o.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {o.lastName} {o.firstName}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatMNT(o.totalMnt)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusChip({
  current,
  value,
  label,
}: {
  current: OrderStatus | undefined;
  value: OrderStatus | undefined;
  label: string;
}) {
  const isActive = current === value;
  const href = value ? `?status=${value}` : "?";
  return (
    <Link
      href={href}
      className={
        "rounded-full border px-3 py-1 text-xs font-medium transition " +
        (isActive ? "bg-foreground text-background border-foreground" : "hover:bg-muted")
      }
    >
      {label}
    </Link>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const colors: Record<OrderStatus, string> = {
    new: "bg-blue-100 text-blue-900",
    confirmed: "bg-indigo-100 text-indigo-900",
    shipping: "bg-amber-100 text-amber-900",
    done: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-zinc-100 text-zinc-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${colors[status]}`}>
      {orderStatusLabel[status]}
    </span>
  );
}
