import { db } from "@/lib/db";
import { orders, orderItems, products, orderStatusLabel } from "@/lib/schema";
import { eq, gte, sql, and, desc, lte } from "drizzle-orm";
import Link from "next/link";
import {
  Wallet,
  ShoppingBag,
  Package,
  TrendingUp,
  ArrowRight,
  Phone,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { formatMNT, formatDate, formatPhone } from "@/lib/utils";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

async function getStats() {
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

  const [pendingAgg] = await db
    .select({
      count: sql<number>`count(*)`,
      revenue: sql<number>`coalesce(sum(${orders.totalMnt}), 0)`,
    })
    .from(orders)
    .where(eq(orders.status, "new"));

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

  // Pending orders (new) — what the operator needs to call NOW
  const pendingOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      phone: orders.phone,
      firstName: orders.firstName,
      lastName: orders.lastName,
      total: orders.totalMnt,
      status: orders.status,
      createdAt: orders.createdAt,
      district: orders.district,
    })
    .from(orders)
    .where(eq(orders.status, "new"))
    .orderBy(desc(orders.createdAt))
    .limit(5);

  // Recent orders (any status)
  const recent = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      phone: orders.phone,
      firstName: orders.firstName,
      lastName: orders.lastName,
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
    pending: { count: pendingAgg?.count ?? 0, revenue: pendingAgg?.revenue ?? 0 },
    dataset,
    top,
    lowStock,
    pendingOrders,
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
    <div>
      <AdminPageHeader
        title="Хяналт"
        description="Дэлгүүрийн өнөөдрийн борлуулалт, шинэ захиалга болон бараа."
        actions={
          <Link
            href="/admin/orders?status=new"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Шинэ захиалга
            {s.pending.count > 0 ? (
              <span className="ml-1 rounded bg-background/20 px-1.5 py-0.5 text-[10px] font-bold">
                {s.pending.count}
              </span>
            ) : null}
          </Link>
        }
      />

      {/* Priority action banner */}
      {s.pending.count > 0 ? (
        <Link
          href="/admin/orders?status=new"
          className="flex items-center justify-between gap-3 rounded-xl border bg-foreground text-background p-4 mb-6 hover:opacity-95 transition group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background/10">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <div className="font-semibold text-sm">
                {s.pending.count} шинэ захиалга баталгаажуулах хүлээж байна
              </div>
              <div className="text-xs text-background/70 mt-0.5">
                Нийт дүн {formatMNT(s.pending.revenue)} · Хэрэглэгчтэй холбогдож баталгаажуулна уу
              </div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
        </Link>
      ) : null}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard
          label="Өнөөдрийн орлого"
          value={formatMNT(s.today.revenue)}
          delta={revenueDelta}
          hint="vs. өчигдөр"
          icon={<Wallet className="h-3.5 w-3.5" />}
        />
        <StatCard
          label="Өнөөдрийн захиалга"
          value={s.today.count}
          icon={<ShoppingBag className="h-3.5 w-3.5" />}
        />
        <StatCard
          label="Өчигдрийн орлого"
          value={formatMNT(s.yesterday.revenue)}
          icon={<TrendingUp className="h-3.5 w-3.5" />}
        />
        <StatCard
          label="Идэвхтэй бараа"
          value={s.top.length > 0 ? "Идэвхтэй" : "0"}
          hint={`${s.lowStock.length} бага нөөцтэй`}
          icon={<Package className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <section className="lg:col-span-2 rounded-xl border bg-background p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Сүүлийн 7 хоногийн орлого</h2>
            <span className="text-[11px] text-muted-foreground">Цуцлагдсанг хасна</span>
          </div>
          <RevenueChart data={s.dataset} />
        </section>
        <section className="rounded-xl border bg-background p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <Crown className="h-3.5 w-3.5" /> 30 хоногт хамгийн их зарагдсан
            </h2>
          </div>
          {s.top.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Өгөгдөл хараахан алга.</p>
          ) : (
            <ol className="space-y-2.5">
              {s.top.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-2.5 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold">
                    {i + 1}
                  </span>
                  <span className="truncate flex-1">{p.name}</span>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {p.qty} шх
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Pending + Recent + Low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-xl border bg-background overflow-hidden">
          <header className="flex items-center justify-between px-5 py-3.5 border-b">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> Сүүлийн захиалга
            </h2>
            <Link href="/admin/orders" className="text-xs text-muted-foreground hover:text-foreground">
              Бүгд →
            </Link>
          </header>
          {s.recent.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Захиалга хараахан байхгүй"
              description="Шинэ захиалга үүсэхэд энд харагдана."
              className="border-0 m-3"
            />
          ) : (
            <ul className="divide-y">
              {s.recent.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span>#{o.orderNumber}</span>
                        <StatusBadge status={o.status} size="xs" />
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {o.lastName} {o.firstName} · {formatPhone(o.phone)} · {formatDate(o.createdAt)}
                      </div>
                    </div>
                    <div className="text-sm font-semibold tabular-nums shrink-0">
                      {formatMNT(o.total)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border bg-background overflow-hidden">
          <header className="flex items-center justify-between px-5 py-3.5 border-b">
            <h2 className="text-sm font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Нөөц багатай бараа
            </h2>
            <Link href="/admin/products" className="text-xs text-muted-foreground hover:text-foreground">
              Бараа →
            </Link>
          </header>
          {s.lowStock.length === 0 ? (
            <EmptyState
              icon={<Package className="h-5 w-5" />}
              title="Бүх бараа хангалттай"
              description="Бага үлдэгдэлтэй бараа алга. Сайн байна!"
              className="border-0 m-3"
            />
          ) : (
            <ul className="divide-y">
              {s.lowStock.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition"
                  >
                    <span className="text-sm font-medium truncate">{p.name}</span>
                    <span className="rounded-full bg-warning/10 text-warning px-2 py-0.5 text-[11px] font-semibold tabular-nums">
                      {p.stock} ширхэг үлдсэн
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Pending orders detail — only show if any */}
      {s.pendingOrders.length > 0 ? (
        <section className="mt-6 rounded-xl border bg-background overflow-hidden">
          <header className="flex items-center justify-between px-5 py-3.5 border-b">
            <h2 className="text-sm font-semibold">
              Баталгаажуулах захиалга ({s.pending.count})
            </h2>
            <Link
              href="/admin/orders?status=new"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Бүгд →
            </Link>
          </header>
          <ul className="divide-y">
            {s.pendingOrders.map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/orders/${o.id}`} className="text-sm font-medium hover:underline">
                    #{o.orderNumber} · {o.lastName} {o.firstName}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {o.district} · {formatDate(o.createdAt)}
                  </div>
                </div>
                <div className="text-sm font-semibold tabular-nums shrink-0 hidden sm:block">
                  {formatMNT(o.total)}
                </div>
                <a
                  href={`tel:${o.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                >
                  <Phone className="h-3 w-3" /> {formatPhone(o.phone)}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
