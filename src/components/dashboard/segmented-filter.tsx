"use client";

import { cn } from "@/lib/utils";

export type SegmentOption<T extends string> = { value: T; label: string; count?: number };

/** Client-side segmented filter (pill group) used above dashboard lists and tables. */
export function SegmentedFilter<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("-mx-1 overflow-x-auto px-1", className)}>
      <div role="group" aria-label={label} className="inline-flex items-center gap-1 rounded-lg border border-line bg-white p-1 shadow-xs">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                active ? "bg-navy-800 text-white" : "text-subtle hover:bg-canvas hover:text-ink",
              )}
            >
              {o.label}
              {o.count !== undefined && (
                <span
                  className={cn(
                    "rounded px-1.5 text-[11px] font-semibold tabular-nums",
                    active ? "bg-white/15 text-white" : "bg-navy-50 text-navy-700",
                  )}
                >
                  {o.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
