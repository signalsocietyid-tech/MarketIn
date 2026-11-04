import { BadgeCheck, CalendarClock, MapPin, Search, TrendingUp, Wallet } from "lucide-react";
import { SocialIcon } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

/**
 * Illustrative product preview for the hero, built from glass panels.
 * Everything shown is fictional sample content, not real users or results.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full text-left" role="img" aria-label="Illustrative preview of the MarketIn dashboard">
      {/* Glow under the window */}
      <div aria-hidden className="absolute inset-x-10 -bottom-6 top-10 rounded-[3rem] bg-brand-400/30 blur-3xl" />

      {/* App window */}
      <div className="glass-strong relative overflow-hidden rounded-[1.75rem] p-2">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <div className="mx-auto flex h-7 w-full max-w-sm items-center justify-center gap-2 rounded-full bg-black/[0.04] px-3 text-[11px] text-muted">
            <Search className="size-3" /> Distributor, East Java, Horeca…
          </div>
          <span className="w-12" />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {/* Opportunity */}
          <Panel className="sm:col-span-2">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white">NC</span>
              <div className="min-w-0">
                <p className="flex items-center gap-1 text-[12px] text-subtle">
                  Nusantara Coffee <BadgeCheck className="size-3.5 fill-brand-500 text-white" />
                </p>
                <p className="truncate text-[15px] font-semibold text-ink">Regional Sales Representative</p>
              </div>
              <span className="ml-auto hidden rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 sm:inline">Featured</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-subtle">
              <Chip icon={MapPin}>Surabaya</Chip>
              <Chip icon={CalendarClock}>26 days left</Chip>
              <Chip icon={Wallet}>Retainer + 7%</Chip>
            </div>
            <div className="mt-4 flex h-16 items-end gap-1.5">
              {[34, 46, 40, 58, 52, 66, 60, 74, 70, 82, 78, 92].map((h, i) => (
                <div
                  key={i}
                  className={cn("flex-1 rounded-full", i > 8 ? "bg-gradient-to-t from-brand-500 to-brand-300" : "bg-brand-100")}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </Panel>

          {/* Pipeline */}
          <Panel>
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Applications</p>
            <ul className="mt-3 space-y-2.5">
              {[
                ["Dimas P.", "Shortlisted"],
                ["Rina W.", "Under review"],
                ["Hendra G.", "Accepted"],
              ].map(([n, s]) => (
                <li key={n} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[12px] text-ink">
                    <span className="flex size-6 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-800">{n[0]}</span>
                    {n}
                  </span>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", s === "Accepted" ? "bg-brand-500 text-white" : "bg-white/80 text-brand-700")}>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <div className="flex justify-between text-[11px]">
                <span className="text-subtle">Pipeline</span>
                <span className="font-semibold text-ink">3 / 8</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-brand-100">
                <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-brand-400 to-brand-500" />
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Floating: sales partner */}
      <div className="glass-strong absolute -bottom-10 -left-4 hidden w-56 rounded-3xl p-4 motion-safe:animate-float lg:-left-16 lg:block">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800">DP</span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 text-[13px] font-semibold text-ink">
              Dimas Pratama <BadgeCheck className="size-3.5 fill-brand-500 text-white" />
            </p>
            <p className="truncate text-[11px] text-subtle">Independent B2B Sales</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1 text-center">
          {[["6 yrs", "Experience"], ["3", "Cities"], ["4.9", "Rating"]].map(([v, l]) => (
            <div key={l} className="rounded-2xl bg-white/70 py-1.5">
              <p className="text-[12px] font-semibold text-ink">{v}</p>
              <p className="text-[9px] text-muted">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating: KOL */}
      <div className="glass-strong absolute -bottom-8 -right-4 hidden w-60 rounded-3xl p-4 motion-safe:animate-float-slow sm:block lg:-right-14">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-300 to-brand-500 text-xs font-semibold text-white">NK</span>
          <div>
            <p className="text-[13px] font-semibold text-ink">Nadia Kusuma</p>
            <p className="text-[11px] text-subtle">KOL · Beauty & Lifestyle</p>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/70 py-1 text-[11px] text-ink">
            <SocialIcon platform="instagram" className="size-3" /> 128K
          </span>
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/70 py-1 text-[11px] text-ink">
            <SocialIcon platform="tiktok" className="size-3" /> 214K
          </span>
          <span className="flex flex-1 items-center justify-center rounded-full bg-brand-500 py-1 text-[11px] font-semibold text-white">4.6% ER</span>
        </div>
      </div>

      {/* Floating: affiliate result */}
      <div className="glass-strong absolute -top-6 right-8 hidden items-center gap-2 rounded-full px-4 py-2 motion-safe:animate-float-slow md:flex">
        <TrendingUp className="size-4 text-brand-600" />
        <span className="text-[12px] font-semibold text-ink">Affiliate campaign · 12% per order</span>
      </div>
    </div>
  );
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[1.25rem] border border-white/70 bg-white/55 p-4", className)}>{children}</div>;
}

function Chip({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <span className="flex items-center justify-center gap-1 rounded-full bg-white/70 px-2 py-1.5">
      <Icon className="size-3" /> {children}
    </span>
  );
}
