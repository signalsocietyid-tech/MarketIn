import { Icon3D, type Icon3DName } from "@/components/brand/icon-3d";
import { SectionHeading } from "@/components/ui/primitives";

const FEATURES: { icon: Icon3DName; title: string; body: string }[] = [
  { icon: "magnifying_glass_tilted_left", title: "Smart Partner Discovery", body: "Search by industry, region, audience and expertise to shortlist the right people faster." },
  { icon: "shield", title: "Verified Profiles", body: "Verification badges for businesses and professionals reviewed by the MarketIn team." },
  { icon: "card_index_dividers", title: "Multiple Partnership Categories", body: "Sales, distribution, affiliate, KOL, UGC and agency partnerships in one place." },
  { icon: "desktop_computer", title: "Centralized Opportunity Management", body: "Publish listings, review applicants and update statuses from one dashboard." },
  { icon: "page_facing_up", title: "Transparent Partnership Information", body: "Compensation model, requirements, deliverables and deadlines shown up front." },
  { icon: "bar_chart", title: "Performance Tracking", body: "Follow leads, conversions, reach and content output for every partnership." },
  { icon: "briefcase", title: "Professional Portfolio", body: "Showcase experience, channels, coverage areas and reviews in a credible profile." },
  { icon: "credit_card", title: "Flexible Subscription Benefits", body: "Start free and upgrade only when you need more listings, reach or analytics." },
];

export function Why() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Why MarketIn" title="More Than Just a Marketplace." description="Tools for every stage of a partnership — from discovery to performance." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => {
            return (
              <div key={f.title} className="glass glass-interactive group flex flex-col items-center rounded-[1.5rem] p-6 text-center">
                <Icon3D name={f.icon} size={56} delay={i * 0.9} />
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
