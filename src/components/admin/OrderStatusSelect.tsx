"use client";

import { useTransition } from "react";
import { orderStatus, orderStatusLabel, type OrderStatus } from "@/lib/schema";
import { updateOrderStatusAction } from "@/server/actions/admin-orders";
import { useRouter } from "next/navigation";

interface Props {
  orderId: string;
  current: OrderStatus;
}

export function OrderStatusSelect({ orderId, current }: Props) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <select
      defaultValue={current}
      disabled={pending}
      onChange={(e) => {
        const next = e.currentTarget.value as OrderStatus;
        start(async () => {
          await updateOrderStatusAction(orderId, next);
          router.refresh();
        });
      }}
      className="rounded-md border bg-background px-3 py-2 text-sm font-medium"
    >
      {orderStatus.map((s) => (
        <option key={s} value={s}>
          {orderStatusLabel[s]}
        </option>
      ))}
    </select>
  );
}
