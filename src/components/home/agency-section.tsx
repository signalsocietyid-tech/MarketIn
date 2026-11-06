import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Icon3D, type Icon3DName } from "@/components/brand/icon-3d";

const FEATURES: { icon: Icon3DName; title: string; body: string }[] = [
  { icon: "busts_in_silhouette", title: "Centralized Talent Management", body: "Creators, affiliates and sales reps in one roster." },
  { icon: "briefcase", title: "Agency Portfolio", body: "Present services, case work and team size." },
  { icon: "inbox_tray", title: "Opportunity Inbox", body: "Business briefs that match your services." },
  { icon: "bar_chart", title: "Team Performance Tracking", body: "See output and results across clients." },
  { icon: "handshake", title: "Partnership Management", body: "Every client campaign and its status." },
  { icon: "telescope", title: "Business Discovery", body: "Find brands actively looking for partners." },
];

const ROSTER = [
  { name: "Laras A.", role: "Beauty · Instagram", status: "On project" },
  { name: "Dewi P.", role: "Lifestyle · TikTok", status: "Available" },
  { name: "Yoga P.", role: "Field sales · Jabodetabek", status: "Available" },
];

export function AgencySection() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="container-page">
        <div className="glass-orange relative overflow-hidden rounded-[2.25rem] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-white/25 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 size-[28rem] rounded-full bg-brand-200/40 blur-3xl" />
          <div className="relative mx-auto max-w-3xl">
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md">
              <span className="size-1.5 rounded-full bg-white" /> For agencies
            </p>
            <h2 className="mt-5 text-[32px] font-semibold leading-[1.1] sm:text-[44px]">Manage Your Network. Unlock More Opportunities.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              Whether you manage sales professionals, creators, or affiliate marketers, MarketIn helps your agency connect with
              businesses and manage partnerships in one place.
            </p>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              return (
                <div key={f.title} className="group flex flex-col items-center rounded-3xl border border-white/30 bg-white/12 p-5 backdrop-blur-md transition-colors hover:bg-white/20">
                  <span className="flex size-16 items-center justify-center rounded-[1.25rem] border border-white/70 bg-white/90 shadow-[inset_0_1px_0_white,0_10px_24px_-12px_rgb(0_0_0/0.35)]">
                    <Icon3D name={f.icon} size={44} delay={i * 1.1} />
                  </span>
                  <p className="mt-3 text-sm font-semibold">{f.title}</p>
                  <p className="mt-1 text-[13px] leading-snug text-white/80">{f.body}</p>
                </div>
              );
            })}
          </div>

          {/* Illustrative roster */}
          <div className="relative mx-auto mt-10 max-w-md rounded-3xl border border-white/40 bg-white/85 p-4 text-left text-ink shadow-[0_24px_60px_-20px_rgb(0_0_0/0.35)] backdrop-blur-xl" role="img" aria-label="Illustrative agency roster preview">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-semibold">Talent roster</p>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">3 of 50 seats</span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {ROSTER.map((r) => (
                <li key={r.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-3 py-2.5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-semibold text-brand-800">
                      {r.name.split(" ").map((p) => p[0]).join("")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{r.name}</span>
                      <span className="block truncate text-xs text-subtle">{r.role}</span>
                    </span>
                  </span>
                  <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${r.status === "Available" ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700"}`}>
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 px-1 text-[11px] text-muted">Illustrative preview with sample data.</p>
          </div>

          <div className="relative mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/register?type=agency"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[15px] font-semibold text-brand-700 shadow-[0_10px_30px_-10px_rgb(0_0_0/0.35)] transition-transform hover:-translate-y-0.5"
            >
              Register Your Agency <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/for-agencies"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/50 bg-white/15 px-6 text-[15px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/25"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
