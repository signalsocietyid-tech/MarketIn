import { BadgeCheck, BarChart3, Briefcase, CreditCard, FileSearch, Layers, ScanSearch, LayoutDashboard } from "lucide-react";
import { SectionHeading } from "@/components/ui/primitives";

const FEATURES = [
  { icon: ScanSearch, title: "Smart Partner Discovery", body: "Search by industry, region, audience and expertise to shortlist the right people faster." },
  { icon: BadgeCheck, title: "Verified Profiles", body: "Verification badges for businesses and professionals reviewed by the MarketIn team." },
  { icon: Layers, title: "Multiple Partnership Categories", body: "Sales, distribution, affiliate, KOL, UGC and agency partnerships in one place." },
  { icon: LayoutDashboard, title: "Centralized Opportunity Management", body: "Publish listings, review applicants and update statuses from one dashboard." },
  { icon: FileSearch, title: "Transparent Partnership Information", body: "Compensation model, requirements, deliverables and deadlines shown up front." },
  { icon: BarChart3, title: "Performance Tracking", body: "Follow leads, conversions, reach and content output for every partnership." },
  { icon: Briefcase, title: "Professional Portfolio", body: "Showcase experience, channels, coverage areas and reviews in a credible profile." },
  { icon: CreditCard, title: "Flexible Subscription Benefits", body: "Start free and upgrade only when you need more listings, reach or analytics." },
];

export function Why() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Why MarketIn" title="More Than Just a Marketplace." description="Tools for every stage of a partnership — from discovery to performance." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass glass-interactive flex flex-col items-center rounded-[1.5rem] p-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/80 shadow-[inset_0_1px_0_white,0_6px_16px_-8px_rgb(244_119_53/0.5)]">
                  <Icon className="size-5 text-brand-600" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
