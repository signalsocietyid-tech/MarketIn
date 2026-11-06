import { Icon3D, type Icon3DName } from "@/components/brand/icon-3d";
import { SectionHeading } from "@/components/ui/primitives";
import { ProfileCard } from "@/components/marketplace/profile-card";
import type { ProfileView } from "@/lib/data/queries";

const PILLARS: { icon: Icon3DName; title: string; body: string }[] = [
  { icon: "classical_building", title: "Verified business profiles", body: "Businesses can request verification, reviewed by our team." },
  { icon: "check_mark_button", title: "Verified professional profiles", body: "Partners earn a badge after their details are checked." },
  { icon: "clipboard", title: "Transparent opportunity details", body: "Compensation, requirements and deliverables are always visible." },
  { icon: "star", title: "Reviews and ratings", body: "Both sides can review each other after working together." },
  { icon: "spiral_calendar", title: "Partnership history", body: "Completed partnerships build a visible track record." },
  { icon: "people_hugging", title: "Community-driven growth", body: "Report tools and moderation keep the marketplace healthy." },
];

export function Trust({ samples }: { samples: ProfileView[] }) {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Trust & community" title="Built for Meaningful Business Partnerships." />
        <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => {
            return (
              <div key={p.title} className="glass glass-interactive group flex flex-col items-center rounded-[1.5rem] p-6 text-center">
                <Icon3D name={p.icon} size={56} delay={i * 1.2} />
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-subtle">{p.body}</p>
              </div>
            );
          })}
        </div>
        {samples.length > 0 && (
          <div className="mt-14">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {samples.map((p) => (
                <ProfileCard key={p.id} profile={p} showSave={false} />
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              Illustrative sample profiles from MarketIn&apos;s demo environment. Names and figures are fictional.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
