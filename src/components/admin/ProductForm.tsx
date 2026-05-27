"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Star } from "lucide-react";
import { upsertProductAction, deleteProductAction } from "@/server/actions/admin-products";
import { cn, formatMNT } from "@/lib/utils";

export interface ProductFormInitial {
  id?: string;
  slug?: string;
  name: string;
  descriptionMd: string;
  howToUseMd: string;
  basePriceMnt: number;
  compareAtPriceMnt: number | null;
  discountPercent: number;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "draft";
  rating: number | null;
  ratingCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  position: number;
  variants: {
    id?: string;
    label: string;
    unitsPerBundle: number;
    priceMnt: number;
    compareAtPriceMnt: number | null;
    discountPercent: number;
    isDefault: boolean;
    position: number;
    badge: string | null;
  }[];
  images: { id?: string; url: string; alt: string | null; position: number; isPrimary: boolean }[];
}

const emptyVariant = () => ({
  label: "",
  unitsPerBundle: 1,
  priceMnt: 0,
  compareAtPriceMnt: null as number | null,
  discountPercent: 0,
  isDefault: false,
  position: 0,
  badge: "" as string | null,
});

export function ProductForm({ initial }: { initial: ProductFormInitial }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProductFormInitial>(initial);
  const [newImageUrl, setNewImageUrl] = useState("");

  const update = (patch: Partial<ProductFormInitial>) => setData((p) => ({ ...p, ...patch }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const result = await upsertProductAction({
        id: data.id,
        slug: data.slug,
        name: data.name,
        descriptionMd: data.descriptionMd,
        howToUseMd: data.howToUseMd,
        basePriceMnt: data.basePriceMnt,
        compareAtPriceMnt: data.compareAtPriceMnt,
        discountPercent: data.discountPercent,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        status: data.status,
        rating: data.rating,
        ratingCount: data.ratingCount,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        position: data.position,
        variants: data.variants,
        images: data.images,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!data.id) return;
    if (!confirm("Энэ барааг устгах уу?")) return;
    start(async () => {
      const r = await deleteProductAction(data.id!);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Үндсэн мэдээлэл">
            <Field label="Нэр" required>
              <input
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Slug (URL)" hint="Хоосон үлдээвэл нэрнээс автомат үүсгэнэ">
              <input
                value={data.slug ?? ""}
                onChange={(e) => update({ slug: e.target.value })}
                className={cn(inputCls, "font-mono text-sm")}
                placeholder="auto"
              />
            </Field>
            <Field label="Тайлбар (Markdown)">
              <textarea
                value={data.descriptionMd}
                onChange={(e) => update({ descriptionMd: e.target.value })}
                rows={5}
                className={inputCls}
              />
            </Field>
            <Field label="Яаж хэрэглэх вэ?">
              <textarea
                value={data.howToUseMd}
                onChange={(e) => update({ howToUseMd: e.target.value })}
                rows={3}
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Зураг">
            <div className="flex flex-wrap gap-3">
              {data.images.map((img, i) => (
                <div
                  key={i}
                  className={cn(
                    "relative h-24 w-24 overflow-hidden rounded-md border bg-muted",
                    img.isPrimary && "ring-2 ring-foreground"
                  )}
                >
                  <Image src={img.url} alt={img.alt ?? ""} fill sizes="96px" className="object-cover" />
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          images: data.images.map((im, j) => ({ ...im, isPrimary: j === i })),
                        })
                      }
                      title="Үндсэн зураг болгох"
                      className={cn(
                        "rounded p-0.5 text-xs",
                        img.isPrimary ? "bg-foreground text-background" : "bg-background/80"
                      )}
                    >
                      <Star className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => update({ images: data.images.filter((_, j) => j !== i) })}
                      className="rounded bg-background/80 p-0.5 text-destructive"
                      title="Устгах"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                type="url"
                placeholder="Зургийн URL (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => {
                  if (!newImageUrl) return;
                  update({
                    images: [
                      ...data.images,
                      {
                        url: newImageUrl,
                        alt: data.name,
                        position: data.images.length,
                        isPrimary: data.images.length === 0,
                      },
                    ],
                  });
                  setNewImageUrl("");
                }}
                className="shrink-0 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background"
              >
                Нэмэх
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Production-д Vercel Blob ашиглан upload хийнэ. Одоохондоо URL-ээр оруулна уу.
            </p>
          </Card>

          <Card title="Variants (багц)">
            <div className="space-y-3">
              {data.variants.map((v, i) => (
                <div key={i} className="rounded-md border p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      type="radio"
                      checked={v.isDefault}
                      onChange={() =>
                        update({
                          variants: data.variants.map((vv, j) => ({
                            ...vv,
                            isDefault: j === i,
                          })),
                        })
                      }
                      className="h-4 w-4 mr-2"
                    />
                    <span className="text-xs text-muted-foreground">
                      {v.isDefault ? "Үндсэн сонголт" : "Үндсэн болгох"}
                    </span>
                    <button
                      type="button"
                      onClick={() => update({ variants: data.variants.filter((_, j) => j !== i) })}
                      className="ml-auto text-destructive"
                      disabled={data.variants.length <= 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Field label="Нэр">
                      <input
                        value={v.label}
                        onChange={(e) =>
                          update({
                            variants: data.variants.map((vv, j) =>
                              j === i ? { ...vv, label: e.target.value } : vv
                            ),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Ширхэг/багц">
                      <input
                        type="number"
                        min={1}
                        value={v.unitsPerBundle}
                        onChange={(e) =>
                          update({
                            variants: data.variants.map((vv, j) =>
                              j === i ? { ...vv, unitsPerBundle: Number(e.target.value) } : vv
                            ),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Үнэ (₮)">
                      <input
                        type="number"
                        min={0}
                        value={v.priceMnt}
                        onChange={(e) =>
                          update({
                            variants: data.variants.map((vv, j) =>
                              j === i ? { ...vv, priceMnt: Number(e.target.value) } : vv
                            ),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Compare at">
                      <input
                        type="number"
                        min={0}
                        value={v.compareAtPriceMnt ?? ""}
                        onChange={(e) =>
                          update({
                            variants: data.variants.map((vv, j) =>
                              j === i
                                ? {
                                    ...vv,
                                    compareAtPriceMnt: e.target.value
                                      ? Number(e.target.value)
                                      : null,
                                  }
                                : vv
                            ),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Хямдрал %">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={v.discountPercent}
                        onChange={(e) =>
                          update({
                            variants: data.variants.map((vv, j) =>
                              j === i ? { ...vv, discountPercent: Number(e.target.value) } : vv
                            ),
                          })
                        }
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Тэмдэг (badge)">
                      <input
                        value={v.badge ?? ""}
                        onChange={(e) =>
                          update({
                            variants: data.variants.map((vv, j) =>
                              j === i ? { ...vv, badge: e.target.value || null } : vv
                            ),
                          })
                        }
                        className={inputCls}
                        placeholder="ж: 1 САР, ХЭМНЭЛТ"
                      />
                    </Field>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  update({
                    variants: [
                      ...data.variants,
                      {
                        ...emptyVariant(),
                        position: data.variants.length,
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-semibold hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" /> Variant нэмэх
              </button>
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card title="Үнэ & Нөөц">
            <Field label="Үндсэн үнэ (₮)" required>
              <input
                type="number"
                min={0}
                value={data.basePriceMnt}
                onChange={(e) => update({ basePriceMnt: Number(e.target.value) })}
                className={inputCls}
                required
              />
            </Field>
            <Field label="Хямдралгүй үнэ (compare at)">
              <input
                type="number"
                min={0}
                value={data.compareAtPriceMnt ?? ""}
                onChange={(e) =>
                  update({
                    compareAtPriceMnt: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputCls}
              />
              {data.compareAtPriceMnt && data.compareAtPriceMnt > data.basePriceMnt ? (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Хэмнэлт: {formatMNT(data.compareAtPriceMnt - data.basePriceMnt)}
                </div>
              ) : null}
            </Field>
            <Field label="Discount % (display only)">
              <input
                type="number"
                min={0}
                max={100}
                value={data.discountPercent}
                onChange={(e) => update({ discountPercent: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Нөөц">
              <input
                type="number"
                min={0}
                value={data.stock}
                onChange={(e) => update({ stock: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
            <Field label="Бага нөөцийн босго">
              <input
                type="number"
                min={0}
                value={data.lowStockThreshold}
                onChange={(e) => update({ lowStockThreshold: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Төлөв">
            <Field label="Status">
              <select
                value={data.status}
                onChange={(e) =>
                  update({ status: e.target.value as "active" | "draft" })
                }
                className={inputCls}
              >
                <option value="draft">Ноорог (нийтлэхгүй)</option>
                <option value="active">Идэвхтэй (нийтлэх)</option>
              </select>
            </Field>
            <Field label="Эрэмбэ (бага бол өмнө)">
              <input
                type="number"
                value={data.position}
                onChange={(e) => update({ position: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="SEO ба үнэлгээ">
            <Field label="SEO Title">
              <input
                value={data.seoTitle ?? ""}
                onChange={(e) => update({ seoTitle: e.target.value || null })}
                className={inputCls}
              />
            </Field>
            <Field label="SEO Description">
              <textarea
                value={data.seoDescription ?? ""}
                onChange={(e) => update({ seoDescription: e.target.value || null })}
                rows={2}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Үнэлгээ (0-5)">
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={5}
                  value={data.rating ?? ""}
                  onChange={(e) =>
                    update({ rating: e.target.value ? Number(e.target.value) : null })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label="Сэтгэгдлийн тоо">
                <input
                  type="number"
                  min={0}
                  value={data.ratingCount}
                  onChange={(e) => update({ ratingCount: Number(e.target.value) })}
                  className={inputCls}
                />
              </Field>
            </div>
          </Card>
        </aside>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2 sticky bottom-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Хадгалж байна…" : data.id ? "Шинэчлэх" : "Үүсгэх"}
        </button>
        {data.id ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-md border border-destructive/40 px-4 py-3 text-sm text-destructive hover:bg-destructive/10"
          >
            Устгах
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md border px-4 py-3 text-sm hover:bg-muted"
        >
          Цуцлах
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
      {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

const inputCls =
  "block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground";
