import { ChevronDown, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

/** Typography for long-form copy without a typography plugin. */
export const PROSE =
  "text-[15px] leading-relaxed text-ink [&_p]:mt-3 [&_p:first-child]:mt-0 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_li]:pl-1 [&_li]:marker:text-muted [&_a]:font-medium [&_a]:text-brand-700 [&_a:hover]:underline [&_strong]:font-semibold [&_strong]:text-navy-900 [&_h3]:mt-6 [&_h3]:font-sans [&_h3]:text-[15px] [&_h3]:font-semibold [&_h3]:tracking-normal [&_h3]:text-navy-900";

/**
 * Shared shell for informational and legal pages: header with title, intro and
 * last-updated date, an optional notice, and an optional sticky table of contents.
 */
export function InfoPage({
  eyebrow,
  title,
  intro,
  lastUpdated,
  notice,
  toc,
  children,
  width = "default",
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  /** ISO date (YYYY-MM-DD). */
  lastUpdated?: string;
  notice?: React.ReactNode;
  toc?: TocItem[];
  children: React.ReactNode;
  width?: "default" | "wide";
}) {
  const hasToc = !!toc && toc.length > 0;
  return (
    <>
      <header className="relative overflow-hidden border-b border-line bg-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
        <div className="container-page relative py-12 sm:py-16">
          <div className="max-w-3xl">
            {eyebrow && <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-700">{eyebrow}</p>}
            <h1 className="text-[32px] font-bold leading-tight text-navy-900 sm:text-[40px]">{title}</h1>
            {intro && <div className="mt-4 text-base leading-relaxed text-subtle sm:text-[17px]">{intro}</div>}
            {lastUpdated && (
              <p className="mt-5 text-[13px] text-muted">
                Last updated <time dateTime={lastUpdated}>{formatLongDate(lastUpdated)}</time>
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="container-page py-10 sm:py-14">
        {notice && <div className="mb-8">{notice}</div>}
        <div
          className={cn(
            hasToc ? "grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14" : "",
            !hasToc && width === "default" && "max-w-3xl",
          )}
        >
          {hasToc && <TableOfContents items={toc} />}
          <div className={cn("min-w-0", hasToc && width === "default" && "max-w-3xl")}>{children}</div>
        </div>
      </div>
    </>
  );
}

function TableOfContents({ items }: { items: TocItem[] }) {
  const list = (
    <ol className="space-y-1 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block rounded-md px-2.5 py-1.5 text-subtle transition-colors hover:bg-white hover:text-navy-900"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ol>
  );
  return (
    <nav aria-label="On this page">
      {/* Mobile: collapsible, no JS needed */}
      <details className="group rounded-xl border border-line bg-white shadow-card lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-navy-900 [&::-webkit-details-marker]:hidden">
          On this page
          <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-t border-line p-2">{list}</div>
      </details>
      {/* Desktop: sticky sidebar */}
      <div className="sticky top-24 hidden lg:block">
        <p className="mb-2 px-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-muted">On this page</p>
        {list}
      </div>
    </nav>
  );
}

/** A titled, anchorable section within an info page. */
export function InfoSection({
  id,
  title,
  number,
  children,
  className,
  bare,
  actions,
}: {
  id: string;
  title: string;
  number?: number;
  children: React.ReactNode;
  className?: string;
  /** Skip long-form typography (for sections that contain cards or custom layouts). */
  bare?: boolean;
  /** Buttons rendered below the copy, outside the prose styles. */
  actions?: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 border-b border-line py-8 first:pt-0 last:border-b-0", className)}>
      <h2 className="flex gap-3 text-xl font-bold text-navy-900 sm:text-[22px]">
        {number !== undefined && <span className="text-muted tabular-nums">{number}.</span>}
        <span>{title}</span>
      </h2>
      <div className={cn("mt-4", !bare && PROSE)}>{children}</div>
      {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
    </section>
  );
}

/** Visible banner for legal drafts awaiting review. */
export function DraftNotice() {
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-warning-600/30 bg-warning-50 px-4 py-3.5 text-sm text-warning-700">
      <FileWarning className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong className="font-semibold">Draft for review — not yet approved by legal counsel.</strong> This document is a
        working draft and may change before MarketIn launches publicly. It does not yet constitute a binding agreement.
      </p>
    </div>
  );
}

function formatLongDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
