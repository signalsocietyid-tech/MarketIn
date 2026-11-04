import * as React from "react";
import { cn, initials, toneFor } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-line bg-white shadow-card", className)} {...props} />;
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-line px-5 py-4", className)}>
      <div className="min-w-0">
        <h3 className="font-sans text-[15px] font-semibold tracking-normal text-ink">{title}</h3>
        {description && <p className="mt-0.5 text-[13px] text-subtle">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-navy-50 text-navy-700 ring-navy-100",
  brand: "bg-brand-50 text-brand-800 ring-brand-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  success: "bg-success-50 text-success-700 ring-emerald-200",
  warning: "bg-warning-50 text-warning-700 ring-amber-200",
  danger: "bg-danger-50 text-danger-700 ring-red-200",
  outline: "bg-white text-subtle ring-line-strong",
  navy: "bg-navy-800 text-white ring-navy-800",
} as const;

export type BadgeTone = keyof typeof badgeTones;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset [&_svg]:size-3",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Avatar({
  name,
  src,
  size = 40,
  square,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  square?: boolean;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.36) };
  const shape = square ? "rounded-lg" : "rounded-full";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- user uploaded data URLs
    return <img src={src} alt={name} style={style} className={cn(shape, "shrink-0 object-cover ring-1 ring-line", className)} />;
  }
  return (
    <span
      aria-hidden
      style={style}
      className={cn(shape, "inline-flex shrink-0 items-center justify-center font-semibold", toneFor(name), className)}
    >
      {initials(name)}
    </span>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn("h-px w-full bg-line", className)} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-navy-50", className)} />;
}

export function Progress({ value, className, tone = "brand" }: { value: number; className?: string; tone?: "brand" | "navy" | "blue" }) {
  const bar = { brand: "bg-brand-500", navy: "bg-navy-800", blue: "bg-blue-500" }[tone];
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-navy-50", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-all", bar)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {Icon && (
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-line bg-canvas text-muted">
          <Icon className="size-5" />
        </div>
      )}
      <p className="text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-subtle">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full min-w-[640px] border-collapse text-sm", className)} {...props} />
    </div>
  );
}
export function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-canvas/70 text-left text-xs font-medium uppercase tracking-wide text-subtle" {...props} />;
}
export function Th({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("border-b border-line px-4 py-2.5 font-medium", className)} {...props} />;
}
export function Td({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("border-b border-line px-4 py-3 align-middle text-ink", className)} {...props} />;
}
export function Tr({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors last:[&>td]:border-b-0 hover:bg-canvas/60", className)} {...props} />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl", className)}>
      {eyebrow && <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">{eyebrow}</p>}
      <h2 className="text-[28px] font-bold leading-tight text-navy-900 sm:text-[34px]">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-subtle sm:text-[17px]">{description}</p>}
    </div>
  );
}
