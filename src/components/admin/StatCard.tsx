import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  delta?: number | null;
  icon?: React.ReactNode;
  hint?: string;
  emphasis?: "default" | "primary";
}

export function StatCard({ label, value, delta, icon, hint, emphasis = "default" }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-background p-4 transition hover:shadow-sm",
        emphasis === "primary" && "bg-foreground text-background border-foreground"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-xs font-medium text-muted-foreground">
          {emphasis === "primary" ? (
            <span className="text-background/70">{label}</span>
          ) : (
            label
          )}
        </div>
        {icon ? (
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              emphasis === "primary"
                ? "bg-background/10 text-background"
                : "bg-muted text-foreground"
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="mt-1 flex items-center gap-2 text-[11px]">
        {delta != null ? (
          <span
            className={cn(
              delta >= 0 ? "text-success" : "text-destructive",
              "font-semibold"
            )}
          >
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        ) : null}
        {hint ? (
          <span
            className={
              emphasis === "primary" ? "text-background/60" : "text-muted-foreground"
            }
          >
            {hint}
          </span>
        ) : null}
      </div>
    </div>
  );
}
