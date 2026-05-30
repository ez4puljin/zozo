import { orderStatusLabel, type OrderStatus } from "@/lib/schema";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  new: "bg-blue-50 text-blue-900 ring-blue-200",
  confirmed: "bg-indigo-50 text-indigo-900 ring-indigo-200",
  shipping: "bg-amber-50 text-amber-900 ring-amber-200",
  done: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  cancelled: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: OrderStatus;
  size?: "xs" | "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold ring-1 ring-inset whitespace-nowrap",
        STYLES[status],
        size === "xs" && "px-1.5 py-0.5 text-[10px]",
        size === "sm" && "px-2 py-0.5 text-[11px]",
        size === "md" && "px-2.5 py-1 text-xs"
      )}
    >
      {orderStatusLabel[status]}
    </span>
  );
}
