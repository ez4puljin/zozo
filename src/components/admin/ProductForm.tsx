"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Star, Info, Sparkles } from "lucide-react";
import { upsertProductAction, deleteProductAction } from "@/server/actions/admin-products";
import { cn, formatMNT } from "@/lib/utils";
import { ImageUploadDropzone } from "./ImageUploadDropzone";

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
  variants: VariantData[];
  images: { id?: string; url: string; alt: string | null; position: number; isPrimary: boolean }[];
}

interface VariantData {
  id?: string;
  label: string;
  unitsPerBundle: number;
  priceMnt: number;
  compareAtPriceMnt: number | null;
  discountPercent: number;
  isDefault: boolean;
  position: number;
  badge: string | null;
}

const emptyVariant = (): VariantData => ({
  label: "",
  unitsPerBundle: 1,
  priceMnt: 0,
  compareAtPriceMnt: null,
  discountPercent: 0,
  isDefault: false,
  position: 0,
  badge: null,
});

/**
 * Quick-start templates for common bundle deals.
 * Click to auto-fill variant rows; admin can then tweak prices.
 */
const VARIANT_PRESETS = [
  {
    label: "Энгийн (1 ширхэг)",
    description: "Зөвхөн 1 ширхэг — урамшуулалгүй",
    icon: "📦",
    build: (basePrice: number): VariantData[] => [
      {
        ...emptyVariant(),
        label: "1 ширхэг",
        unitsPerBundle: 1,
        priceMnt: basePrice,
        compareAtPriceMnt: null,
        discountPercent: 0,
        isDefault: true,
        position: 0,
      },
    ],
  },
  {
    label: "2+1 БЭЛЭГ",
    description: "Хамгийн алдартай. 2 авбал 1 БЭЛЭГ.",
    icon: "🎁",
    build: (basePrice: number): VariantData[] => [
      {
        ...emptyVariant(),
        label: "1 ширхэг",
        unitsPerBundle: 1,
        priceMnt: basePrice,
        compareAtPriceMnt: null,
        discountPercent: 0,
        isDefault: false,
        position: 0,
      },
      {
        ...emptyVariant(),
        label: "2 авбал 1 БЭЛЭГ",
        unitsPerBundle: 3,
        priceMnt: basePrice * 2,
        compareAtPriceMnt: basePrice * 3,
        discountPercent: 33,
        isDefault: true,
        position: 1,
        badge: "ХАМГИЙН ТОХИРОМЖТОЙ",
      },
    ],
  },
  {
    label: "3+1 БЭЛЭГ",
    description: "3 авбал 1 БЭЛЭГ — томоохон хямдрал",
    icon: "🎁🎁",
    build: (basePrice: number): VariantData[] => [
      {
        ...emptyVariant(),
        label: "1 ширхэг",
        unitsPerBundle: 1,
        priceMnt: basePrice,
        compareAtPriceMnt: null,
        discountPercent: 0,
        isDefault: false,
        position: 0,
      },
      {
        ...emptyVariant(),
        label: "3 авбал 1 БЭЛЭГ",
        unitsPerBundle: 4,
        priceMnt: basePrice * 3,
        compareAtPriceMnt: basePrice * 4,
        discountPercent: 25,
        isDefault: true,
        position: 1,
        badge: "ХЭМНЭЛТ",
      },
    ],
  },
  {
    label: "5+1 БЭЛЭГ",
    description: "Бөөний худалдаа — 5 авбал 1 БЭЛЭГ",
    icon: "📦📦",
    build: (basePrice: number): VariantData[] => [
      {
        ...emptyVariant(),
        label: "1 ширхэг",
        unitsPerBundle: 1,
        priceMnt: basePrice,
        compareAtPriceMnt: null,
        discountPercent: 0,
        isDefault: true,
        position: 0,
      },
      {
        ...emptyVariant(),
        label: "5 авбал 1 БЭЛЭГ",
        unitsPerBundle: 6,
        priceMnt: basePrice * 5,
        compareAtPriceMnt: basePrice * 6,
        discountPercent: 17,
        isDefault: false,
        position: 1,
        badge: "БӨӨНИЙ",
      },
    ],
  },
];

export function ProductForm({ initial }: { initial: ProductFormInitial }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProductFormInitial>(initial);
  const [newImageUrl, setNewImageUrl] = useState("");

  const update = (patch: Partial<ProductFormInitial>) => setData((p) => ({ ...p, ...patch }));

  const applyPreset = (preset: (typeof VARIANT_PRESETS)[number]) => {
    if (data.basePriceMnt <= 0) {
      alert("Эхлээд баруун талын 'Үндсэн үнэ'-г бичиж өгнө үү. Үүний дараа preset товч дарна.");
      return;
    }
    update({ variants: preset.build(data.basePriceMnt) });
  };

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
    if (!confirm("Энэ барааг устгах уу? (Захиалгатай бараа устгагдахгүй)")) return;
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
    <form onSubmit={onSubmit} className="space-y-6 pb-24">
      {/* Top help banner */}
      {!data.id ? (
        <InfoBox>
          <strong>💡 Анхны бараа нэмэх үе:</strong> Доорх алхмуудыг дарааллаар хий — <b>1)</b> Нэр + үнэ бичих, <b>2)</b> Зураг оруулах, <b>3)</b> "Урамшуулал шаблон" сонгох (2+1 г.м), <b>4)</b> Статус &ldquo;Идэвхтэй&rdquo; болгоод хадгалах.
        </InfoBox>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Basic Info */}
          <Card title="1. Үндсэн мэдээлэл" stepNumber={1}>
            <Field
              label="Барааны нэр"
              hint="Хэрэглэгчид харагдах нэр. Жишээ: 'Мөөгтэй кофе', 'Premium коллаген'."
              required
            >
              <input
                value={data.name}
                onChange={(e) => update({ name: e.target.value })}
                className={inputCls}
                placeholder="Жишээ: Мөөгтэй кофе"
                required
              />
            </Field>
            <Field
              label="URL slug"
              hint="Хоосон үлдээвэл нэрнээс автомат үүснэ. Жишээ: 'moogtei-coffee'. Latin үсэг, тоо, dash ашиглах."
            >
              <input
                value={data.slug ?? ""}
                onChange={(e) => update({ slug: e.target.value })}
                className={cn(inputCls, "font-mono text-sm")}
                placeholder="автомат үүснэ"
              />
              {data.slug ? (
                <div className="mt-1 text-[11px] text-muted-foreground">
                  URL: <span className="font-mono">/products/{data.slug}</span>
                </div>
              ) : null}
            </Field>
            <Field
              label="Барааны тайлбар"
              hint="Барааны хуудсанд гарах гол тайлбар. Цэг таслал, мөр шилжүүлэлт ашиглаж болно."
            >
              <textarea
                value={data.descriptionMd}
                onChange={(e) => update({ descriptionMd: e.target.value })}
                rows={5}
                className={inputCls}
                placeholder="Жишээ: Энэхүү бүтээгдэхүүн нь органик найрлагатай, эрүүл мэндэд тустай..."
              />
            </Field>
            <Field
              label="Хэрэглэх заавар"
              hint="Хэрэглэгч бараагаа хэрхэн ашиглахыг тайлбарлана."
            >
              <textarea
                value={data.howToUseMd}
                onChange={(e) => update({ howToUseMd: e.target.value })}
                rows={3}
                className={inputCls}
                placeholder="Жишээ: 1 халбага нунтгийг 200мл буцалсан устай холь..."
              />
            </Field>
          </Card>

          {/* Images */}
          <Card title="2. Зураг" stepNumber={2}>
            <p className="text-xs text-muted-foreground mb-3">
              Зөвлөмж: 1 удаа 3-5 зураг оруулна. Үндсэн зургийг ⭐ товчоор тэмдэглэнэ — энэ нь
              барааны хуудас, Facebook share-д харагдана.
            </p>

            {data.images.length > 0 ? (
              <div className="flex flex-wrap gap-3 mb-3">
                {data.images.map((img, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative h-28 w-28 overflow-hidden rounded-md border bg-muted",
                      img.isPrimary && "ring-2 ring-foreground"
                    )}
                  >
                    <Image src={img.url} alt={img.alt ?? ""} fill sizes="112px" className="object-cover" />
                    {img.isPrimary ? (
                      <div className="absolute bottom-1 left-1 rounded bg-foreground text-background px-1.5 py-0.5 text-[10px] font-bold">
                        ⭐ Үндсэн
                      </div>
                    ) : null}
                    <div className="absolute top-1 right-1 flex gap-1">
                      {!img.isPrimary ? (
                        <button
                          type="button"
                          onClick={() =>
                            update({
                              images: data.images.map((im, j) => ({ ...im, isPrimary: j === i })),
                            })
                          }
                          title="Үндсэн зураг болгох"
                          className="rounded bg-background/90 p-1 text-xs shadow"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          const next = data.images.filter((_, j) => j !== i);
                          // If we removed the primary, promote the first
                          if (img.isPrimary && next.length > 0) next[0].isPrimary = true;
                          update({ images: next });
                        }}
                        className="rounded bg-background/90 p-1 text-destructive shadow"
                        title="Устгах"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <ImageUploadDropzone
              onUpload={(url) => {
                update({
                  images: [
                    ...data.images,
                    {
                      url,
                      alt: data.name,
                      position: data.images.length,
                      isPrimary: data.images.length === 0,
                    },
                  ],
                });
              }}
            />

            <details className="mt-3">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                Эсвэл зургийн URL-ээр нэмэх (зураг өөр сайтад байгаа бол)
              </summary>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://..."
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
                  className="shrink-0 rounded-md border px-3 py-2 text-xs font-semibold"
                >
                  Нэмэх
                </button>
              </div>
            </details>
          </Card>

          {/* Variants — the most important UX */}
          <Card title="3. Үнэ ба урамшуулал" stepNumber={3}>
            <InfoBox>
              <strong>📚 Энэ хэсэг гэж юу вэ?</strong>
              <br />
              Нэг бүтээгдэхүүний өөр өөр <b>багц/тоо</b>-н сонголтыг энд тохируулна. Жишээ:
              <ul className="mt-1 ml-4 list-disc">
                <li>
                  <b>1 ширхэг</b> — энгийн худалдаа
                </li>
                <li>
                  <b>2 авбал 1 БЭЛЭГ</b> — 2 ширхэг үнээр 3 ширхэг өгөх (хэрэглэгч их сонгодог)
                </li>
              </ul>
              <br />
              <span className="text-xs">
                💡 <b>Зөвлөмж:</b> Доорх "Урамшуулал шаблон"-оос дарж автомат бөглөж аваарай.
              </span>
            </InfoBox>

            {/* Preset templates */}
            <div className="space-y-2">
              <div className="text-xs font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Урамшуулал шаблон (нэг дарвал бүх variant
                бөглөгдөнө)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VARIANT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="flex flex-col items-start gap-1 rounded-md border p-3 text-left hover:bg-muted transition"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs font-semibold">{p.label}</span>
                    <span className="text-[10px] text-muted-foreground line-clamp-2">
                      {p.description}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                ⚠️ Preset товч дарахын өмнө баруун талын &ldquo;Үндсэн үнэ&rdquo;-г бөглөнө үү.
                Үнэ автомат тооцоолно.
              </p>
            </div>

            <div className="border-t my-3" />

            {/* Variants list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold">Variant-ууд ({data.variants.length})</div>
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
                  className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                >
                  <Plus className="h-3 w-3" /> Variant нэмэх
                </button>
              </div>

              {data.variants.map((v, i) => (
                <VariantCard
                  key={i}
                  variant={v}
                  index={i}
                  total={data.variants.length}
                  onChange={(patch) =>
                    update({
                      variants: data.variants.map((vv, j) =>
                        j === i ? { ...vv, ...patch } : vv
                      ),
                    })
                  }
                  onSetDefault={() =>
                    update({
                      variants: data.variants.map((vv, j) => ({ ...vv, isDefault: j === i })),
                    })
                  }
                  onRemove={() =>
                    update({ variants: data.variants.filter((_, j) => j !== i) })
                  }
                  onMoveUp={
                    i > 0
                      ? () => {
                          const next = [...data.variants];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          update({ variants: next });
                        }
                      : undefined
                  }
                  onMoveDown={
                    i < data.variants.length - 1
                      ? () => {
                          const next = [...data.variants];
                          [next[i], next[i + 1]] = [next[i + 1], next[i]];
                          update({ variants: next });
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card title="Үндсэн үнэ" stepNumber={1}>
            <Field
              label="Үндсэн үнэ (₮)"
              hint="Энэ үнийг preset шаблон ашиглах үед эх үнэ болгож тооцоолно."
              required
            >
              <input
                type="number"
                min={0}
                step={1000}
                value={data.basePriceMnt}
                onChange={(e) => update({ basePriceMnt: Number(e.target.value) })}
                className={inputCls}
                placeholder="59000"
                required
              />
            </Field>
            <Field
              label="Хямдралгүй үнэ"
              hint="Бараан дээр зураастай харагдах 'хуучин' үнэ (compare-at). Хэмнэлт хэр болохыг харуулна."
            >
              <input
                type="number"
                min={0}
                step={1000}
                value={data.compareAtPriceMnt ?? ""}
                onChange={(e) =>
                  update({
                    compareAtPriceMnt: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={inputCls}
                placeholder="89000"
              />
              {data.compareAtPriceMnt && data.compareAtPriceMnt > data.basePriceMnt ? (
                <div className="mt-1 rounded bg-success/10 text-success px-2 py-1 text-[11px]">
                  💰 Хэмнэлт: {formatMNT(data.compareAtPriceMnt - data.basePriceMnt)}
                </div>
              ) : null}
            </Field>
            <Field
              label="Хямдралын тэмдэг (%)"
              hint="Каталогт бараан дээр харагдах '-33%' гэх мэт тэмдэг."
            >
              <input
                type="number"
                min={0}
                max={100}
                value={data.discountPercent}
                onChange={(e) => update({ discountPercent: Number(e.target.value) })}
                className={inputCls}
                placeholder="33"
              />
            </Field>
          </Card>

          <Card title="Нөөц" stepNumber={4}>
            <Field
              label="Нөөц (ширхэг)"
              hint="Танд хэдэн ширхэг бэлэн байгаа. Захиалга авагдсаны дараа автомат хасагдана."
            >
              <input
                type="number"
                min={0}
                value={data.stock}
                onChange={(e) => update({ stock: Number(e.target.value) })}
                className={inputCls}
                placeholder="100"
              />
            </Field>
            <Field
              label="Бага нөөцийн босго"
              hint="Энэ тооноос доош буухад admin dashboard-д сэрэмжлэл харагдана."
            >
              <input
                type="number"
                min={0}
                value={data.lowStockThreshold}
                onChange={(e) => update({ lowStockThreshold: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="Нийтлэх статус" stepNumber={5}>
            <Field
              label="Status"
              hint="Идэвхтэй = хэрэглэгчид харагдана. Ноорог = зөвхөн админд."
            >
              <select
                value={data.status}
                onChange={(e) =>
                  update({ status: e.target.value as "active" | "draft" })
                }
                className={inputCls}
              >
                <option value="draft">Ноорог (зөвхөн админд)</option>
                <option value="active">Идэвхтэй (хэрэглэгчид харагдана)</option>
              </select>
            </Field>
            <Field
              label="Эрэмбэ"
              hint="Каталогт яаж эрэмбэлэх вэ. Бага тоо = өмнө гарна."
            >
              <input
                type="number"
                value={data.position}
                onChange={(e) => update({ position: Number(e.target.value) })}
                className={inputCls}
              />
            </Field>
          </Card>

          <Card title="SEO ба үнэлгээ (нэмэлт)">
            <Field
              label="SEO Title"
              hint="Google хайлт болон Facebook share-д харагдах гарчиг. Хоосон бол барааны нэрийг ашиглана."
            >
              <input
                value={data.seoTitle ?? ""}
                onChange={(e) => update({ seoTitle: e.target.value || null })}
                className={inputCls}
                placeholder={data.name}
              />
            </Field>
            <Field
              label="SEO Description"
              hint="Хайлтын үр дүнд харагдах товч тайлбар (160 тэмдэгт)."
            >
              <textarea
                value={data.seoDescription ?? ""}
                onChange={(e) => update({ seoDescription: e.target.value || null })}
                rows={2}
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Үнэлгээ (0-5)" hint="Сэтгэгдэлгүй учир гар тааруулна.">
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
                  placeholder="4.5"
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

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t px-4 py-3 lg:left-60">
        <div className="mx-auto max-w-5xl flex items-center justify-end gap-2">
          {data.id ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="mr-auto rounded-md border border-destructive/40 px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              Устгах
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
          >
            Цуцлах
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-foreground px-6 py-2 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Хадгалж байна…" : data.id ? "Шинэчлэх" : "Хадгалах"}
          </button>
        </div>
      </div>
    </form>
  );
}

/* ---------- Subcomponents ---------- */

function VariantCard({
  variant: v,
  index,
  total,
  onChange,
  onSetDefault,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  variant: VariantData;
  index: number;
  total: number;
  onChange: (patch: Partial<VariantData>) => void;
  onSetDefault: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}) {
  const savings =
    v.compareAtPriceMnt && v.compareAtPriceMnt > v.priceMnt
      ? v.compareAtPriceMnt - v.priceMnt
      : 0;
  return (
    <div
      className={cn(
        "rounded-md border p-3 space-y-3",
        v.isDefault && "border-foreground bg-muted/20"
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSetDefault}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition",
            v.isDefault
              ? "border-foreground bg-foreground text-background"
              : "hover:bg-muted"
          )}
        >
          {v.isDefault ? "✓ Үндсэн сонголт" : "Үндсэн болгох"}
        </button>
        <span className="text-xs text-muted-foreground ml-1">
          {v.isDefault ? "(хэрэглэгчид сонгогдсон байна)" : ""}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {onMoveUp ? (
            <button
              type="button"
              onClick={onMoveUp}
              className="rounded p-1 hover:bg-muted text-muted-foreground"
              title="Дээш"
            >
              ↑
            </button>
          ) : null}
          {onMoveDown ? (
            <button
              type="button"
              onClick={onMoveDown}
              className="rounded p-1 hover:bg-muted text-muted-foreground"
              title="Доош"
            >
              ↓
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            disabled={total <= 1}
            className="rounded p-1 text-destructive disabled:opacity-30"
            title="Variant устгах"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Field
          label="Нэр (хэрэглэгчид харагдана)"
          hint='Жишээ: "1 ширхэг", "2 авбал 1 БЭЛЭГ", "3 авбал 1 БЭЛЭГ"'
        >
          <input
            value={v.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className={inputCls}
            placeholder="2 авбал 1 БЭЛЭГ"
          />
        </Field>
        <Field
          label="Тэмдэг (нэмэлт)"
          hint='Variant дээр гарах жижиг тэмдэг. Жишээ: "ХАМГИЙН ТОХИРОМЖТОЙ", "ХЭМНЭЛТ".'
        >
          <input
            value={v.badge ?? ""}
            onChange={(e) => onChange({ badge: e.target.value || null })}
            className={inputCls}
            placeholder="(хоосон үлдээж болно)"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Field
          label="Хэдэн ширхэг ШИГ ҮҮС вэ?"
          hint="2+1 урамшуулалд 3 ширхэг (2 худалдан + 1 БЭЛЭГ) хүргэгдэнэ — энд '3' гэж бичнэ."
        >
          <input
            type="number"
            min={1}
            value={v.unitsPerBundle}
            onChange={(e) => onChange({ unitsPerBundle: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
        <Field
          label="Variant үнэ (₮)"
          hint="Хэрэглэгчид төлөх дүн. 2+1 урамшуулалд 2 ширхэгийн үнэ (1-ийн биш!)."
          required
        >
          <input
            type="number"
            min={0}
            step={1000}
            value={v.priceMnt}
            onChange={(e) => onChange({ priceMnt: Number(e.target.value) })}
            className={inputCls}
          />
        </Field>
        <Field
          label="Compare-at үнэ (₮)"
          hint="Зураастай 'хуучин' үнэ. Хэмнэлтийг харуулна."
        >
          <input
            type="number"
            min={0}
            step={1000}
            value={v.compareAtPriceMnt ?? ""}
            onChange={(e) =>
              onChange({
                compareAtPriceMnt: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Хямдрал % (тэмдэг)" hint="Variant дээр харагдах '-33%'-ийн тэмдэг.">
        <input
          type="number"
          min={0}
          max={100}
          value={v.discountPercent}
          onChange={(e) => onChange({ discountPercent: Number(e.target.value) })}
          className={cn(inputCls, "max-w-32")}
        />
      </Field>

      {/* Live preview */}
      {v.label && v.priceMnt > 0 ? (
        <div className="rounded-md border border-dashed bg-background p-3 mt-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            👁 Хэрэглэгчид ийм харагдана:
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              {v.badge ? (
                <span className="inline-block mb-1 rounded bg-foreground text-background px-2 py-0.5 text-[10px] font-semibold uppercase">
                  {v.badge}
                </span>
              ) : null}
              <div className="font-semibold text-sm">{v.label}</div>
              {savings > 0 ? (
                <div className="text-[11px] text-success">
                  Хэмнэлт {formatMNT(savings)}
                </div>
              ) : null}
            </div>
            <div className="text-right">
              <div className="font-bold">{formatMNT(v.priceMnt)}</div>
              {v.compareAtPriceMnt && v.compareAtPriceMnt > v.priceMnt ? (
                <div className="text-xs text-muted-foreground line-through-thin">
                  {formatMNT(v.compareAtPriceMnt)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Card({
  title,
  stepNumber,
  children,
}: {
  title: string;
  stepNumber?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        {stepNumber ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold">
            {stepNumber}
          </span>
        ) : null}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
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
      {hint ? (
        <div className="mt-1 text-[11px] text-muted-foreground leading-snug">{hint}</div>
      ) : null}
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3 text-xs leading-relaxed">
      <div className="flex gap-2">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <div>{children}</div>
      </div>
    </div>
  );
}

const inputCls =
  "block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground";
