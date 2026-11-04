import Link from "next/link";
import { ArrowRight, BarChart3, Briefcase, FolderKanban, Inbox, Search, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: UsersRound, title: "Centralized Talent Management", body: "Creators, affiliates and sales reps in one roster." },
  { icon: Briefcase, title: "Agency Portfolio", body: "Present services, case work and team size." },
  { icon: Inbox, title: "Opportunity Inbox", body: "Business briefs that match your services." },
  { icon: BarChart3, title: "Team Performance Tracking", body: "See output and results across clients." },
  { icon: FolderKanban, title: "Partnership Management", body: "Every client campaign and its status." },
  { icon: Search, title: "Business Discovery", body: "Find brands actively looking for partners." },
];

const ROSTER = [
  { name: "Laras A.", role: "Beauty · Instagram", status: "On project", tone: "bg-brand-50 text-brand-800" },
  { name: "Dewi P.", role: "Lifestyle · TikTok", status: "Available", tone: "bg-success-50 text-success-700" },
  { name: "Yoga P.", role: "Field sales · Jabodetabek", status: "Available", tone: "bg-success-50 text-success-700" },
  { name: "Citra M.", role: "Beauty affiliate", status: "On project", tone: "bg-brand-50 text-brand-800" },
];

export function AgencySection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="container-page">
        <div className="overflow-hidden rounded-2xl bg-navy-900 text-white">
          <div className="grid gap-12 p-8 sm:p-12 lg:grid-cols-[1fr_1.05fr] lg:p-14">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-brand-300">For agencies</p>
              <h2 className="mt-3 text-[28px] font-bold leading-tight sm:text-[34px]">Manage Your Network. Unlock More Opportunities.</h2>
              <p className="mt-4 max-w-lg leading-relaxed text-navy-100">
                Whether you manage sales professionals, creators, or affiliate marketers, MarketIn helps your agency connect
                with businesses and manage partnerships in one place.
              </p>
              <div className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {FEATURES.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white/10">
                        <Icon className="size-4 text-brand-300" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{f.title}</p>
                        <p className="mt-0.5 text-[13px] leading-snug text-navy-200">{f.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/register?type=agency">
                    Register Your Agency <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="text-navy-100 hover:bg-white/10 hover:text-white">
                  <Link href="/for-agencies">Learn more</Link>
                </Button>
              </div>
            </div>

            {/* Illustrative roster panel */}
            <div className="self-center rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5" role="img" aria-label="Illustrative agency roster preview">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Talent roster</p>
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] text-navy-100">4 of 50 seats</span>
              </div>
              <ul className="mt-4 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-navy-950/40">
                {ROSTER.map((r) => (
                  <li key={r.name} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold">
                        {r.name.split(" ").map((p) => p[0]).join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        <p className="truncate text-xs text-navy-200">{r.role}</p>
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${r.tone}`}>{r.status}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[["3", "Client campaigns"], ["12", "Proposals"], ["2", "Inbox briefs"]].map(([v, l]) => (
                  <div key={l} className="rounded-lg border border-white/10 px-3 py-2.5">
                    <p className="font-display text-xl font-bold">{v}</p>
                    <p className="text-[11px] text-navy-200">{l}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-navy-200/80">Illustrative preview with sample data.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
