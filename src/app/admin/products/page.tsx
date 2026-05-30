import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/schema";
import { eq, asc, and, like, or, sql } from "drizzle-orm";
import { formatMNT } from "@/lib/utils";
import { Plus, Package, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { EmptyState } from "@/components/admin/EmptyState";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>;
}

async function listProducts(opts: { q?: string; status?: "active" | "draft" }) {
  const conds = [];
  if (opts.status) conds.push(eq(products.status, opts.status));
  if (opts.q) {
    conds.push(or(like(products.name, `%${opts.q}%`), like(products.slug, `%${opts.q}%`)));
  }
  const where =
    conds.length === 0 ? undefined : conds.length === 1 ? conds[0] : and(...conds);

  const list = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(asc(products.position), asc(products.name));

  return Promise.all(
    list.map(async (p) => {
      const [img] = await db
        .select({ url: productImages.url })
        .from(productImages)
        .where(and(eq(productImages.productId, p.id), eq(productImages.isPrimary, true)))
        .limit(1);
      const fallback = !img
        ? await db
            .select({ url: productImages.url })
            .from(productImages)
            .where(eq(productImages.productId, p.id))
            .orderBy(asc(productImages.position))
            .limit(1)
        : [];
      return { ...p, imageUrl: img?.url ?? fallback[0]?.url ?? null };
    })
  );
}

async function getCounts() {
  const rows = await db
    .select({ status: products.status, count: sql<number>`count(*)` })
    .from(products)
    .groupBy(products.status);
  const map = new Map<"active" | "draft", number>();
  for (const r of rows) map.set(r.status, r.count);
  return {
    active: map.get("active") ?? 0,
    draft: map.get("draft") ?? 0,
    total: rows.reduce((s, r) => s + r.count, 0),
  };
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const status = (sp.status === "active" || sp.status === "draft") ? sp.status : undefined;

  const [list, counts] = await Promise.all([listProducts({ q, status }), getCounts()]);
  const lowStockCount = list.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <div>
      <AdminPageHeader
        title="Бараа"
        description={`Нийт ${counts.total} бараа · ${counts.active} идэвхтэй · ${counts.draft} ноорог${
          lowStockCount > 0 ? ` · ${lowStockCount} нөөц багатай` : ""
        }`}
        breadcrumbs={[{ label: "Хяналт", href: "/admin" }, { label: "Бараа" }]}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Шинэ бараа
          </Link>
        }
      />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterChip current={status} value={undefined} label="Бүгд" count={counts.total} />
        <FilterChip current={status} value="active" label="Идэвхтэй" count={counts.active} />
        <FilterChip current={status} value="draft" label="Ноорог" count={counts.draft} />
      </div>

      <form className="flex items-center gap-2 mb-4" action="">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Нэр эсвэл slug-аар хайх"
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

      <div className="rounded-xl border bg-background overflow-hidden">
        {list.length === 0 ? (
          <EmptyState
            icon={<Package className="h-5 w-5" />}
            title={q ? "Илэрц олдсонгүй" : "Бараа алга"}
            description={q ? `"${q}" нэртэй бараа байхгүй.` : "Шинэ бараа нэмэх эсвэл импортлоно уу."}
            action={
              !q ? (
                <Link
                  href="/admin/products/new"
                  className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" /> Шинэ бараа нэмэх
                </Link>
              ) : null
            }
            className="border-0"
          />
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden sm:table w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2.5 font-semibold">Бараа</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Үнэ</th>
                  <th className="text-right px-4 py-2.5 font-semibold">Нөөц</th>
                  <th className="text-left px-4 py-2.5 font-semibold">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-3 hover:underline"
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono truncate">
                            /{p.slug}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums whitespace-nowrap">
                      {formatMNT(p.basePriceMnt)}
                      {p.compareAtPriceMnt && p.compareAtPriceMnt > p.basePriceMnt ? (
                        <div className="text-[11px] text-muted-foreground line-through-thin">
                          {formatMNT(p.compareAtPriceMnt)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span
                        className={cn(
                          p.stock === 0 && "text-destructive font-semibold",
                          p.stock > 0 && p.stock <= p.lowStockThreshold && "text-warning font-semibold"
                        )}
                      >
                        {p.stock}
                      </span>
                      {p.stock > 0 && p.stock <= p.lowStockThreshold ? (
                        <div className="text-[10px] text-warning">Бага</div>
                      ) : p.stock === 0 ? (
                        <div className="text-[10px] text-destructive">Дууссан</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                          p.status === "active"
                            ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                            : "bg-zinc-100 text-zinc-700 ring-zinc-200"
                        )}
                      >
                        {p.status === "active" ? "Идэвхтэй" : "Ноорог"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="sm:hidden divide-y">
              {list.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.name} fill sizes="56px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {formatMNT(p.basePriceMnt)} · {p.stock} ширхэг
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                        p.status === "active"
                          ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                          : "bg-zinc-100 text-zinc-700 ring-zinc-200"
                      )}
                    >
                      {p.status === "active" ? "Идэвхтэй" : "Ноорог"}
                    </span>
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

function FilterChip({
  current,
  value,
  label,
  count,
}: {
  current: string | undefined;
  value: string | undefined;
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
