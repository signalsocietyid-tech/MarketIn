import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Linked metric tile used on the admin overview. `attention` highlights a non-empty queue. */
export function KpiCard({
  href,
  label,
  value,
  hint,
  icon: Icon,
  attention,
}: {
  href: string;
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  attention?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col rounded-xl border bg-white p-4 shadow-card transition-colors hover:border-navy-200",
        attention ? "border-brand-200" : "border-line",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            attention ? "bg-brand-50 text-brand-700" : "bg-navy-50 text-navy-700",
          )}
        >
          <Icon className="size-4" />
        </span>
        <ArrowUpRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-navy-900">{value}</p>
      <p className="mt-0.5 text-[13px] font-medium text-ink">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-subtle">{hint}</p>}
    </Link>
  );
}
