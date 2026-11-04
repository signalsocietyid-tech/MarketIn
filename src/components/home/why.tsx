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
    <section className="border-y border-line bg-white py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why MarketIn"
          title="More Than Just a Marketplace."
          description="Tools for every stage of a partnership — from discovery to performance."
        />
        <div className="mt-12 grid overflow-hidden rounded-xl border border-line sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="border-b border-line bg-white p-6 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(n+7)]:border-b-0 lg:border-r lg:[&:nth-child(4n)]:border-r-0 lg:[&:nth-child(n+5)]:border-b-0">
                <Icon className="size-5 text-brand-600" />
                <h3 className="mt-4 font-sans text-[15px] font-semibold tracking-normal text-navy-900">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{f.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
