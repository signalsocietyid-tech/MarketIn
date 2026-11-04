import { Handshake, LineChart, Search, UserPlus } from "lucide-react";
import { SectionHeading } from "@/components/ui/primitives";

const STEPS = [
  { icon: UserPlus, title: "Create Your Profile", body: "Register as a business, sales partner, creator, or agency." },
  { icon: Search, title: "Discover Opportunities", body: "Browse relevant opportunities or find suitable partners." },
  { icon: Handshake, title: "Connect & Collaborate", body: "Apply, review applications, communicate, and negotiate." },
  { icon: LineChart, title: "Grow Together", body: "Manage partnerships and monitor your performance." },
];

export function Workflow() {
  return (
    <section className="py-20 sm:py-24" id="how-it-works">
      <div className="container-page">
        <SectionHeading eyebrow="How MarketIn works" title="Your Next Partnership Starts Here." />
        <ol className="relative mt-14 grid gap-8 lg:grid-cols-4 lg:gap-6">
          <div aria-hidden className="absolute left-5 top-5 hidden h-px w-[calc(100%-2.5rem)] bg-gradient-to-r from-brand-300 via-line-strong to-line lg:block" />
          <div aria-hidden className="absolute bottom-6 left-5 top-5 w-px bg-line-strong lg:hidden" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="relative flex gap-5 lg:flex-col lg:gap-0">
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-white shadow-card">
                  <Icon className="size-[18px] text-brand-600" />
                </span>
                <div className="lg:mt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Step {i + 1}</p>
                  <h3 className="mt-1.5 font-sans text-lg font-semibold tracking-tight text-navy-900">{s.title}</h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-subtle">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
