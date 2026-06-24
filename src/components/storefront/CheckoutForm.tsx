"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutFormSchema, type CheckoutFormData } from "@/lib/checkout/schema";
import { useCart } from "@/lib/cart/store";
import { createOrderAction } from "@/server/actions/checkout";
import { formatMNT, cn } from "@/lib/utils";
import { SHIPPING_MNT, SHIPPING_LABEL } from "@/lib/constants";
import Image from "next/image";
import { Check } from "lucide-react";

const STORAGE_KEY = "zozo-customer-profile-v1";

interface SavedProfile {
  phone?: string;
  firstName?: string;
  lastName?: string;
  district?: string;
  khoroo?: string;
  building?: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  additionalPhone?: string;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, totals, clear } = useCart();
  const t = totals();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [autofilled, setAutofilled] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      saveForNextTime: true,
    },
  });

  // Auto-fill from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as SavedProfile;
        const fields: (keyof SavedProfile)[] = [
          "phone",
          "firstName",
          "district",
          "khoroo",
          "building",
          "entrance",
          "floor",
          "apartment",
          "additionalPhone",
        ];
        let any = false;
        for (const f of fields) {
          if (saved[f]) {
            setValue(f as keyof CheckoutFormData, saved[f]!);
            any = true;
          }
        }
        if (any) setAutofilled(true);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire InitiateCheckout pixel once
  useEffect(() => {
    if (items.length > 0 && typeof window !== "undefined") {
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (fbq) {
        fbq("track", "InitiateCheckout", {
          value: t.totalMnt,
          currency: "MNT",
          content_ids: items.map((i) => i.productId),
          num_items: items.reduce((s, i) => s + i.quantity, 0),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    reset({ saveForNextTime: true });
    setAutofilled(false);
  };

  const onSubmit = (form: CheckoutFormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction({
        customer: form,
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          quantity: it.quantity,
        })),
        referrer: document.referrer || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      // Track Purchase
      if (typeof window !== "undefined") {
        const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
        if (fbq) {
          fbq("track", "Purchase", {
            value: t.totalMnt,
            currency: "MNT",
            content_ids: items.map((i) => i.productId),
            num_items: items.reduce((s, i) => s + i.quantity, 0),
          });
        }
      }

      // Save profile if requested
      if (form.saveForNextTime) {
        const profile: SavedProfile = {
          phone: form.phone,
          firstName: form.firstName,
          district: form.district,
          khoroo: form.khoroo || undefined,
          building: form.building || undefined,
          entrance: form.entrance || undefined,
          floor: form.floor || undefined,
          apartment: form.apartment || undefined,
          additionalPhone: form.additionalPhone || undefined,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      }

      clear();
      router.push(`/checkout/success/${result.orderNumber}`);
    });
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Сагс хоосон байна.</p>
        <button
          onClick={() => router.push("/collections/all")}
          className="mt-4 underline underline-offset-4"
        >
          Бараа үзэх
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {autofilled ? (
          <div className="flex items-start gap-2 rounded-md border bg-muted/50 px-3 py-2.5 text-xs">
            <Check className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              Өмнөх мэдээллээ автоматаар бөглөлөө.{" "}
              <button
                type="button"
                onClick={onClearProfile}
                className="underline underline-offset-2"
              >
                Цэвэрлэх
              </button>
            </div>
          </div>
        ) : null}

        {/* Contact */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Холбоо барих мэдээлэл</h2>
          <Field
            label="Утасны дугаар"
            error={errors.phone?.message}
            required
          >
            <input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              {...register("phone")}
              className={inputCls(!!errors.phone)}
              placeholder="99112233"
            />
          </Field>
        </section>

        {/* Shipping */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Хүргэлт</h2>
          <div className="rounded-md border bg-muted/30 px-3 py-2 mb-3 text-sm">
            <span className="font-medium">Улс:</span> Монгол
          </div>

          <Field label="Нэр" error={errors.firstName?.message} required>
            <input
              {...register("firstName")}
              className={inputCls(!!errors.firstName)}
              placeholder="Таны нэр"
            />
          </Field>

          <Field label="Дүүрэг/Аймаг" error={errors.district?.message} required>
            <input {...register("district")} className={inputCls(!!errors.district)} />
          </Field>

          <Field label="Сум/Хороо">
            <input {...register("khoroo")} className={inputCls(false)} />
          </Field>

          <Field label="Байр, орц, давхар, тоот">
            <input
              {...register("building")}
              className={inputCls(false)}
              placeholder="Жишээ: 12-р байр, 3 орц, 5 давхар, 27 тоот"
            />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Орц">
              <input {...register("entrance")} className={inputCls(false)} />
            </Field>
            <Field label="Давхар">
              <input {...register("floor")} className={inputCls(false)} />
            </Field>
            <Field label="Тоот">
              <input {...register("apartment")} className={inputCls(false)} />
            </Field>
          </div>

          <Field label="Нэмэлт утас" error={errors.additionalPhone?.message}>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              {...register("additionalPhone")}
              className={inputCls(!!errors.additionalPhone)}
              placeholder="99776655"
            />
          </Field>

          <Field label="Тэмдэглэл">
            <textarea
              {...register("notes")}
              className={cn(inputCls(false), "min-h-20")}
              placeholder="Хүргэгчид зориулсан нэмэлт мэдээлэл"
            />
          </Field>

          <label className="mt-3 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              defaultChecked
              {...register("saveForNextTime")}
              className="h-4 w-4"
            />
            Энэ мэдээллийг хадгалах
          </label>
        </section>

        {/* Shipping Method */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Хүргэлтийн төрөл</h2>
          <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-3 text-sm">
            <span className="font-medium">ШУУРХАЙ ХҮРГЭЛТ · {SHIPPING_LABEL}</span>
            <span className="font-semibold">{formatMNT(SHIPPING_MNT)}</span>
          </div>
        </section>

        {/* Payment */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Төлбөр</h2>
          <div className="rounded-md border bg-muted/30 px-3 py-3 text-sm font-medium">
            АВАХДАА ТӨЛӨХ
          </div>
        </section>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="block w-full rounded-full bg-foreground py-4 text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.99] disabled:opacity-50 transition"
        >
          {pending ? "Илгээж байна…" : "Захиалах"}
        </button>
      </form>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border p-5 space-y-4 bg-muted/20">
          <h3 className="font-semibold">Захиалга</h3>
          <ul className="space-y-3 divide-y">
            {items.map((it) => (
              <li key={it.key} className="flex gap-3 pt-3 first:pt-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  {it.imageUrl ? (
                    <Image src={it.imageUrl} alt={it.productName} fill sizes="64px" className="object-cover" />
                  ) : null}
                  <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-semibold px-1">
                    {it.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium line-clamp-2">{it.productName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{it.variantLabel}</div>
                </div>
                <div className="text-sm font-semibold">{formatMNT(it.unitPriceMnt * it.quantity)}</div>
              </li>
            ))}
          </ul>
          <div className="space-y-1.5 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дэд дүн</span>
              <span>{formatMNT(t.subtotalMnt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Хүргэлт ({SHIPPING_LABEL})</span>
              <span className="font-medium">{formatMNT(t.shippingMnt)}</span>
            </div>
            {t.savingsMnt > 0 ? (
              <div className="flex justify-between text-success">
                <span>Хэмнэлт</span>
                <span>-{formatMNT(t.savingsMnt)}</span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between border-t pt-2">
              <span className="font-semibold">Нийт төлөх</span>
              <span className="text-lg font-bold">{formatMNT(t.totalMnt)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
      {error ? <div className="mt-1 text-xs text-destructive">{error}</div> : null}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "block w-full rounded-md border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-foreground",
    hasError && "border-destructive focus:ring-destructive"
  );
}
