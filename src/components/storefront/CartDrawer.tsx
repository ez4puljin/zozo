"use client";

import { useCart } from "@/lib/cart/store";
import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { cn, formatMNT } from "@/lib/utils";
import { SHIPPING_LABEL } from "@/lib/constants";

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totals } = useCart();
  const t = totals();

  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={cn(
          "fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm transition-opacity",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Сагс"
        className={cn(
          "fixed top-0 right-0 z-50 h-dvh w-full sm:w-[420px] bg-background shadow-xl flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <div className="text-lg font-bold">Сагс</div>
            <div className="text-xs text-muted-foreground">
              {t.bundleCount} ширхэг
            </div>
          </div>
          <button
            onClick={closeCart}
            aria-label="Хаах"
            className="rounded-md p-2 hover:bg-muted transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">Сагс хоосон байна.</div>
            <Link
              href="/collections/all"
              onClick={closeCart}
              className="mt-2 text-sm underline underline-offset-4 hover:opacity-70"
            >
              Бараа үзэх
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((it) => (
                <li key={it.key} className="flex gap-3">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {it.imageUrl ? (
                      <Image
                        src={it.imageUrl}
                        alt={it.productName}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <Link
                      href={`/products/${it.productSlug}`}
                      onClick={closeCart}
                      className="text-sm font-medium hover:underline line-clamp-2"
                    >
                      {it.productName}
                    </Link>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {it.variantLabel}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-md border">
                        <button
                          onClick={() => updateQty(it.key, it.quantity - 1)}
                          className="px-2 py-1 hover:bg-muted transition"
                          aria-label="Хасах"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 text-center text-sm">
                          {it.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(it.key, it.quantity + 1)}
                          className="px-2 py-1 hover:bg-muted transition"
                          aria-label="Нэмэх"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-sm font-semibold">
                        {formatMNT(it.unitPriceMnt * it.quantity)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(it.key)}
                    aria-label="Устгах"
                    className="self-start text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="border-t px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Дэд дүн</span>
                <span>{formatMNT(t.subtotalMnt)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Хүргэлт ({SHIPPING_LABEL})</span>
                <span className="font-medium">{formatMNT(t.shippingMnt)}</span>
              </div>
              {t.savingsMnt > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Хэмнэлт</span>
                  <span className="text-success font-semibold">
                    -{formatMNT(t.savingsMnt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="text-base font-semibold">Нийт төлөх</span>
                <span className="text-lg font-bold">{formatMNT(t.totalMnt)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-full bg-foreground py-3.5 text-sm font-semibold uppercase tracking-wider text-background hover:opacity-90 active:scale-[0.99] transition"
              >
                Захиалах
              </Link>
              <div className="text-center text-xs text-muted-foreground">
                Авахдаа төлөх · Захиалга + хүргэлтийн төлбөрийг хүлээн авахдаа төлнө
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
