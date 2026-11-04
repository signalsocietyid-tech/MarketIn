import { BadgeCheck, CalendarClock, MapPin, MoreHorizontal, Search, TrendingUp, Wallet } from "lucide-react";
import { SocialIcon } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

/**
 * Static, illustrative product preview for the hero. Data shown here is
 * fictional sample content, not real users or results.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none" aria-label="Illustrative preview of the MarketIn dashboard" role="img">
      {/* App window */}
      <div className="relative overflow-hidden rounded-xl border border-line bg-white shadow-panel">
        <div className="flex items-center gap-2 border-b border-line bg-canvas/70 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <div className="ml-3 flex h-6 flex-1 items-center gap-2 rounded-md border border-line bg-white px-2 text-[11px] text-muted">
            <Search className="size-3" /> Distributor, East Java, Horeca…
          </div>
        </div>

        <div className="grid grid-cols-[1fr] gap-3 p-4 sm:grid-cols-[1.25fr_1fr]">
          {/* Opportunity card */}
          <div className="rounded-lg border border-line p-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-md bg-navy-800 text-[11px] font-bold text-white">NC</span>
                <div>
                  <p className="flex items-center gap-1 text-[11px] text-subtle">
                    Nusantara Coffee <BadgeCheck className="size-3 fill-blue-500 text-white" />
                  </p>
                  <p className="text-[13px] font-semibold leading-tight text-ink">Regional Sales Representative</p>
                </div>
              </div>
              <MoreHorizontal className="size-4 text-muted" />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <Chip className="bg-navy-50 text-navy-700">Sales & Distribution</Chip>
              <Chip className="bg-brand-50 text-brand-800">Featured</Chip>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-subtle">
              <span className="flex items-center gap-1"><MapPin className="size-3" /> Surabaya</span>
              <span className="flex items-center gap-1"><CalendarClock className="size-3" /> 26d left</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 rounded-md bg-canvas px-2.5 py-1.5 text-[11px] font-medium text-navy-800">
              <Wallet className="size-3 text-muted" /> Retainer + 7% commission
            </div>
          </div>

          {/* Pipeline */}
          <div className="rounded-lg border border-line p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Applications</p>
            <ul className="mt-2.5 space-y-2">
              {[
                ["Dimas P.", "Shortlisted", "bg-brand-50 text-brand-800"],
                ["Rina W.", "Under Review", "bg-blue-50 text-blue-700"],
                ["Hendra G.", "Accepted", "bg-success-50 text-success-700"],
              ].map(([n, s, c]) => (
                <li key={n} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[12px] text-ink">
                    <span className="flex size-5 items-center justify-center rounded-full bg-navy-100 text-[9px] font-semibold text-navy-800">{n[0]}</span>
                    {n}
                  </span>
                  <Chip className={c}>{s}</Chip>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-line pt-2.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-subtle">Pipeline progress</span>
                <span className="font-semibold text-ink">3 / 8</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-navy-50">
                <div className="h-full w-[38%] rounded-full bg-brand-500" />
              </div>
            </div>
          </div>

          {/* Affiliate campaign */}
          <div className="rounded-lg border border-line p-3.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-subtle">Affiliate Campaign · Kirana Skincare</p>
                <p className="text-[13px] font-semibold text-ink">12% commission per order</p>
              </div>
              <span className="flex items-center gap-1 rounded-md bg-success-50 px-2 py-1 text-[11px] font-semibold text-success-700">
                <TrendingUp className="size-3" /> Active
              </span>
            </div>
            <div className="mt-3 flex h-12 items-end gap-1">
              {[30, 42, 38, 55, 48, 62, 58, 70, 66, 78, 74, 88].map((h, i) => (
                <div key={i} className={cn("flex-1 rounded-sm", i > 8 ? "bg-brand-400" : "bg-navy-100")} style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating: sales partner */}
      <div className="absolute -bottom-10 -left-10 hidden w-56 rounded-xl border border-line bg-white p-3.5 shadow-lift xl:block">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">DP</span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[13px] font-semibold text-ink">
              Dimas Pratama <BadgeCheck className="size-3.5 fill-blue-500 text-white" />
            </p>
            <p className="truncate text-[11px] text-subtle">Independent B2B Sales</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 text-center">
          {[["6 yrs", "Experience"], ["3", "Cities"], ["4.9", "Rating"]].map(([v, l]) => (
            <div key={l} className="rounded-md bg-canvas py-1.5">
              <p className="text-[12px] font-semibold text-navy-900">{v}</p>
              <p className="text-[9px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating: KOL */}
      <div className="absolute -bottom-8 -right-4 hidden w-60 rounded-xl border border-line bg-white p-3.5 shadow-lift sm:block">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">NK</span>
          <div>
            <p className="text-[13px] font-semibold text-ink">Nadia Kusuma</p>
            <p className="text-[11px] text-subtle">KOL · Beauty & Lifestyle</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex flex-1 items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] text-ink">
            <SocialIcon platform="instagram" className="size-3 text-subtle" /> 128K
          </span>
          <span className="flex flex-1 items-center gap-1.5 rounded-md border border-line px-2 py-1 text-[11px] text-ink">
            <SocialIcon platform="tiktok" className="size-3 text-subtle" /> 214K
          </span>
          <span className="flex flex-1 items-center justify-center rounded-md bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-800">4.6% ER</span>
        </div>
      </div>
    </div>
  );
}

function Chip({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", className)}>{children}</span>;
}
