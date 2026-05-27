import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { products, productImages } from "@/lib/schema";
import { eq, asc, and } from "drizzle-orm";
import { formatMNT } from "@/lib/utils";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

async function listProducts() {
  const list = await db.select().from(products).orderBy(asc(products.position));
  // Attach primary image
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

export default async function AdminProductsPage() {
  const list = await listProducts();

  return (
    <div className="space-y-5">
      <header className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Бараа</h1>
          <p className="text-sm text-muted-foreground">Нийт: {list.length}</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90"
        >
          <Plus className="h-3.5 w-3.5" /> Шинэ бараа
        </Link>
      </header>

      <div className="rounded-lg border bg-background overflow-hidden">
        {list.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Бараа алга. Шинээр нэмнэ үү.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2">Бараа</th>
                <th className="text-right px-4 py-2 hidden sm:table-cell">Үнэ</th>
                <th className="text-right px-4 py-2">Нөөц</th>
                <th className="text-left px-4 py-2">Төлөв</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:underline">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                        {p.imageUrl ? (
                          <Image src={p.imageUrl} alt={p.name} fill sizes="48px" className="object-cover" />
                        ) : null}
                      </div>
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">{p.slug}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold hidden sm:table-cell">
                    {formatMNT(p.basePriceMnt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        p.stock <= p.lowStockThreshold
                          ? "text-warning font-semibold"
                          : ""
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold " +
                        (p.status === "active"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-zinc-100 text-zinc-700")
                      }
                    >
                      {p.status === "active" ? "Идэвхтэй" : "Ноорог"}
                    </span>
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
