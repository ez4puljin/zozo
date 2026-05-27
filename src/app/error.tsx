"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Алдаа гарлаа</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Уучлаарай, гэнэтийн алдаа гарсан байна.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
        >
          Дахин оролдох
        </button>
        <Link
          href="/"
          className="rounded-md border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          Нүүр хуудас
        </Link>
      </div>
    </div>
  );
}
