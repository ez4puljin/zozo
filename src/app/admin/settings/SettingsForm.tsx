"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "@/server/actions/admin-settings";

interface Initial {
  promoBannerText: string;
  promoBannerEnabled: boolean;
  announcementMd: string | null;
  shopPhone: string | null;
  shopEmail: string | null;
}

export function SettingsForm({ initial }: { initial: Initial }) {
  const [data, setData] = useState(initial);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const r = await updateSettingsAction(data);
          if (!r.ok) {
            setError(r.error);
            return;
          }
          setSavedAt(new Date());
        });
      }}
      className="space-y-4"
    >
      <Card title="Promo banner">
        <label className="inline-flex items-center gap-2 text-sm mb-2">
          <input
            type="checkbox"
            checked={data.promoBannerEnabled}
            onChange={(e) => setData((d) => ({ ...d, promoBannerEnabled: e.target.checked }))}
            className="h-4 w-4"
          />
          Идэвхтэй
        </label>
        <input
          value={data.promoBannerText}
          onChange={(e) => setData((d) => ({ ...d, promoBannerText: e.target.value }))}
          className={inputCls}
          placeholder="Чанарын баталгаатай | Шуурхай хүргэлт"
        />
      </Card>

      <Card title="Дэлгүүрийн холбоо барих">
        <Field label="Утас">
          <input
            value={data.shopPhone ?? ""}
            onChange={(e) => setData((d) => ({ ...d, shopPhone: e.target.value || null }))}
            className={inputCls}
            placeholder="9999-9999"
          />
        </Field>
        <Field label="И-мэйл">
          <input
            type="email"
            value={data.shopEmail ?? ""}
            onChange={(e) => setData((d) => ({ ...d, shopEmail: e.target.value || null }))}
            className={inputCls}
            placeholder="info@zozo.mn"
          />
        </Field>
      </Card>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Хадгалж байна…" : "Хадгалах"}
        </button>
        {savedAt ? (
          <span className="text-xs text-success">✓ Хадгалагдсан</span>
        ) : null}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "block w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground";
