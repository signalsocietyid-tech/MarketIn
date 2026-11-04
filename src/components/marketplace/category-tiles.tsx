import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORY_META } from "@/lib/constants";
import { pluralize } from "@/lib/utils";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "./category-config";

export function CategoryTiles({ counts }: { counts: Record<string, number> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CATEGORY_ORDER.map((c) => {
        const meta = CATEGORY_META[c];
        const cfg = CATEGORY_CONFIG[c];
        const Icon = cfg.icon;
        return (
          <li key={c}>
            <Link
              href={meta.href}
              className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-sans text-[15px] font-semibold tracking-normal text-navy-900">{meta.label}</h3>
              <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-subtle">{cfg.description}</p>
              <span className="mt-auto flex items-center justify-between pt-4 text-[13px]">
                <span className="font-medium text-ink">{pluralize(counts[c] ?? 0, "open listing")}</span>
                <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function FindPartnersStrip() {
  return (
    <section className="rounded-xl border border-line bg-navy-900 p-6 text-white sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-white">Find partners</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-navy-100">
            Browse partner directories and reach out to the people who can grow your distribution, sales and reach.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[560px]">
          {CATEGORY_ORDER.map((c) => {
            const cfg = CATEGORY_CONFIG[c];
            const Icon = cfg.icon;
            return (
              <li key={c}>
                <Link
                  href={`${CATEGORY_META[c].href}?view=partners`}
                  className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:border-white/25 hover:bg-white/10"
                >
                  <Icon className="size-4 shrink-0 text-brand-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{cfg.partnerLabel}</span>
                    <span className="block truncate text-xs text-navy-200">{cfg.partnerDescription}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-navy-200 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
