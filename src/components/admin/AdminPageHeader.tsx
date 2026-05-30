import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}

export function AdminPageHeader({ title, description, breadcrumbs, actions }: Props) {
  return (
    <div className="border-b pb-5 mb-6">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              {c.href ? (
                <Link href={c.href} className="hover:text-foreground transition">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < breadcrumbs.length - 1 ? <ChevronRight className="h-3 w-3" /> : null}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}
