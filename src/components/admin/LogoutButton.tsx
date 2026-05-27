"use client";

import { useTransition } from "react";
import { logoutAction } from "@/server/actions/auth";
import { LogOut } from "lucide-react";

export function LogoutButton({ compact }: { compact?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => logoutAction())}
      disabled={pending}
      className={
        compact
          ? "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          : "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      }
    >
      <LogOut className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      Гарах
    </button>
  );
}
