import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin нэвтрэх",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-sm flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-center">Admin Login</h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Дэлгүүрийн удирдлагын самбарт нэвтрэнэ үү.
      </p>
      <div className="mt-8">
        <Suspense fallback={<div className="text-sm text-muted-foreground">Уншиж байна…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
