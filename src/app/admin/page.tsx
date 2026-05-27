import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/schema";
import { eq, gte, sql, and, desc, lte } from "drizzle-orm";
import Link from "next/link";
import { formatMNT, formatDate } from "@/lib/utils";
import { orderStatusLabel } from "@/lib/schema";
import { RevenueChart } from "@/components/admin/RevenueChart";

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function getStats() {
  // Use UB-time approximation by shifting +8h since this is for display
  const now = new Date();
  const ub = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const todayStart = startOfDayUTC(ub);
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [todayAgg] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.totalMnt}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, todayStart), sql`${orders.status} != 'cancelled'`));

  const [yesterdayAgg] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.totalMnt}), 0)`,
      count: sql<number>`count(*)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, yesterdayStart),
        lte(orders.createdAt, todayStart),
        sql`${orders.status} != 'cancelled'`
      )
    );

  // 7-day revenue chart
  const chartRows = await db
    .select({
      date: sql<string>`date(${orders.createdAt}, 'unixepoch', '+8 hours')`,
      revenue: sql<number>`coalesce(sum(${orders.totalMnt}), 0)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, sevenDaysAgo), sql`${orders.status} != 'cancelled'`))
    .groupBy(sql`date(${orders.createdAt}, 'unixepoch', '+8 hours')`)
    .orderBy(sql`date(${orders.createdAt}, 'unixepoch', '+8 hours')`);

  const dataset: { date: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const found = chartRows.find((r) => r.date === key);
    dataset.push({
      date: `${d.getUTCMonth() + 1}/${d.getUTCDate()}`,
      revenue: found?.revenue ?? 0,
    });
  }

  // Top products last 30 days
  const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);
  const top = await db
    .select({
      productId: orderItems.productId,
      name: orderItems.productNameSnapshot,
      qty: sql<number>`sum(${orderItems.quantity})`,
      revenue: sql<number>`sum(${orderItems.lineTotalMnt})`,
    })
    .from(orderItems)
    .leftJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(gte(orders.createdAt, thirtyDaysAgo), sql`${orders.status} != 'cancelled'`))
    .groupBy(orderItems.productId, orderItems.productNameSnapshot)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(5);

  // Low stock
  const lowStock = await db
    .select()
    .from(products)
    .where(and(eq(products.status, "active"), sql`${products.stock} <= ${products.lowStockThreshold}`))
    .limit(8);

  // Recent orders
  const recent = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      phone: orders.phone,
      total: orders.totalMnt,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(8);

  return {
    today: { revenue: todayAgg?.revenue ?? 0, count: todayAgg?.count ?? 0 },
    yesterday: { revenue: yesterdayAgg?.revenue ?? 0, count: yesterdayAgg?.count ?? 0 },
    dataset,
    top,
    lowStock,
    recent,
  };
}

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await getStats();
  const revenueDelta =
    s.yesterday.revenue > 0
      ? Math.round(((s.today.revenue - s.yesterday.revenue) / s.yesterday.revenue) * 100)
      : null;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Хяналт</h1>
          <p className="text-sm text-muted-foreground">Өнөөдрийн борлуулалт ба үйл ажиллагаа</p>
        </div>
        <Link
          href="/admin/orders"
          className="hidden sm:inline-flex rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
        >
          Захиалга →
        </Link>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Өнөөдрийн орлого" value={formatMNT(s.today.revenue)} delta={revenueDelta} />
        <StatCard label="Өнөөдрийн захиалга" value={String(s.today.count)} />
        <StatCard label="Өчигдрийн орлого" value={formatMNT(s.yesterday.revenue)} />
        <StatCard label="Өчигдрийн захиалга" value={String(s.yesterday.count)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg border bg-background p-5">
          <h2 className="text-sm font-semibold mb-4">Сүүлийн 7 хоног</h2>
          <RevenueChart data={s.dataset} />
        </div>
        <div className="rounded-lg border bg-background p-5">
          <h2 className="text-sm font-semibold mb-3">Хамгийн их зарагдсан</h2>
          {s.top.length === 0 ? (
            <p className="text-xs text-muted-foreground">Өгөгдөл алга</p>
          ) : (
            <ul className="space-y-2">
              {s.top.map((p) => (
                <li key={p.productId} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2">{p.name}</span>
                  <span className="text-muted-foreground text-xs">{p.qty} ширхэг</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Сүүлийн захиалга</h2>
            <Link href="/admin/orders" className="text-xs underline">
              Бүгдийг үзэх
            </Link>
          </div>
          {s.recent.length === 0 ? (
            <p className="text-xs text-muted-foreground">Захиалга алга</p>
          ) : (
            <ul className="divide-y">
              {s.recent.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-2 py-2 hover:bg-muted/40 rounded px-1"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium">#{o.orderNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {o.phone} · {formatDate(o.createdAt)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold">{formatMNT(o.total)}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {orderStatusLabel[o.status]}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border bg-background p-5">
          <h2 className="text-sm font-semibold mb-3">Нөөц багатай</h2>
          {s.lowStock.length === 0 ? (
            <p className="text-xs text-muted-foreground">Бүх бараа хангалттай.</p>
          ) : (
            <ul className="divide-y">
              {s.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <Link href={`/admin/products/${p.id}`} className="text-sm font-medium hover:underline">
                    {p.name}
                  </Link>
                  <span className="text-xs rounded bg-warning/10 text-warning px-2 py-0.5 font-semibold">
                    {p.stock} ширхэг үлдсэн
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold tracking-tight">{value}</div>
      {delta != null ? (
        <div
          className={`text-[11px] mt-1 ${
            delta >= 0 ? "text-success" : "text-destructive"
          }`}
        >
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs өчигдөр
        </div>
      ) : null}
    </div>
  );
}
