"use client";

import { useState, useTransition } from "react";
import { updateInternalNotesAction } from "@/server/actions/admin-orders";

export function OrderInternalNotes({
  orderId,
  initial,
}: {
  orderId: string;
  initial: string;
}) {
  const [value, setValue] = useState(initial ?? "");
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  return (
    <div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value === initial) return;
          start(async () => {
            await updateInternalNotesAction(orderId, value);
            setSavedAt(new Date());
          });
        }}
        rows={3}
        placeholder="Жишээ: хэрэглэгч 6 цагт хүлээж байна, гэх мэт"
        className="block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
      />
      <div className="mt-1 text-[11px] text-muted-foreground">
        {pending
          ? "Хадгалж байна…"
          : savedAt
          ? "✓ Хадгалагдсан"
          : "Анхааруулах: blur хийгдэхэд автомат хадгална."}
      </div>
    </div>
  );
}
