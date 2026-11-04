import Link from "next/link";
import { cn } from "@/lib/utils";
import { hrefWith } from "./search-params";

export type FilterTab = { value?: string; label: string; count?: number };

/** URL-driven segmented tabs. Preserves the other active filters. */
export function FilterTabs({
  pathname,
  param,
  current,
  params,
  tabs,
  className,
}: {
  pathname: string;
  param: string;
  current?: string;
  params: Record<string, string>;
  tabs: FilterTab[];
  className?: string;
}) {
  return (
    <nav aria-label="Filter" className={cn("-mx-1 overflow-x-auto px-1", className)}>
      <ul className="inline-flex items-center gap-1 rounded-lg border border-line bg-white p-1 shadow-xs">
        {tabs.map((t) => {
          const active = (t.value ?? "") === (current ?? "");
          return (
            <li key={t.value ?? "all"}>
              <Link
                href={hrefWith(pathname, params, { [param]: t.value })}
                aria-current={active ? "page" : undefined}
                scroll={false}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-navy-800 text-white" : "text-subtle hover:bg-canvas hover:text-ink",
                )}
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={cn(
                      "rounded px-1.5 text-[11px] font-semibold tabular-nums",
                      active ? "bg-white/15 text-white" : "bg-navy-50 text-navy-700",
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
