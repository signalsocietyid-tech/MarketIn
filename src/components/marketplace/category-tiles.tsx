import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon3D } from "@/components/brand/icon-3d";
import { CATEGORY_META } from "@/lib/constants";
import { pluralize } from "@/lib/utils";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "./category-config";

export function CategoryTiles({ counts }: { counts: Record<string, number> }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CATEGORY_ORDER.map((c, i) => {
        const meta = CATEGORY_META[c];
        const cfg = CATEGORY_CONFIG[c];
        return (
          <li key={c}>
            <Link
              href={meta.href}
              className="glass glass-interactive group flex h-full flex-col items-center rounded-[1.5rem] p-6 text-center"
            >
              <Icon3D name={cfg.icon3d} size={60} delay={i * 1.4} />
              <h3 className="mt-4 text-[15px] font-semibold text-ink">{meta.label}</h3>
              <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-subtle">{cfg.description}</p>
              <span className="mt-auto flex items-center justify-center gap-2 pt-4 text-[13px]">
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
    <section className="glass-orange relative overflow-hidden rounded-[2rem] p-6 text-center text-white sm:p-10">
      <div aria-hidden className="pointer-events-none absolute -left-20 -top-24 size-72 rounded-full bg-white/25 blur-3xl" />
      <div className="relative flex flex-col items-center gap-8">
        <div className="max-w-lg">
          <h2 className="text-2xl font-semibold text-white">Find partners</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/85">
            Browse partner directories and reach out to the people who can grow your distribution, sales and reach.
          </p>
        </div>
        <ul className="grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {CATEGORY_ORDER.map((c) => {
            const cfg = CATEGORY_CONFIG[c];
            return (
              <li key={c}>
                <Link
                  href={`${CATEGORY_META[c].href}?view=partners`}
                  className="group flex items-center gap-3 rounded-2xl border border-white/30 bg-white/12 px-4 py-3 backdrop-blur-md transition-colors hover:bg-white/22"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/90">
                    <Icon3D name={cfg.icon3d} size={28} float={false} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{cfg.partnerLabel}</span>
                    <span className="block truncate text-xs text-white/80">{cfg.partnerDescription}</span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-white/80 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
