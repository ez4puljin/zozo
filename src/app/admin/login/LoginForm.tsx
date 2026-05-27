"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/server/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const from = sp.get("from") || "/admin";
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const password = String(fd.get("password") ?? "");
        setError(null);
        start(async () => {
          const r = await loginAction(password);
          if (r.ok) {
            router.replace(from);
            router.refresh();
          } else {
            setError(r.error);
          }
        });
      }}
      className="space-y-3"
    >
      <input
        type="password"
        name="password"
        placeholder="Нууц үг"
        autoFocus
        required
        className="block w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-foreground"
      />
      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="block w-full rounded-md bg-foreground py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition"
      >
        {pending ? "Шалгаж байна…" : "Нэвтрэх"}
      </button>
    </form>
  );
}
