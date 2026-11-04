import { BadgeCheck, FileText, History, Star, UserCheck, UsersRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/primitives";
import { ProfileCard } from "@/components/marketplace/profile-card";
import type { ProfileView } from "@/lib/data/queries";

const PILLARS = [
  { icon: BadgeCheck, title: "Verified business profiles", body: "Businesses can request verification, reviewed by our team." },
  { icon: UserCheck, title: "Verified professional profiles", body: "Partners earn a badge after their details are checked." },
  { icon: FileText, title: "Transparent opportunity details", body: "Compensation, requirements and deliverables are always visible." },
  { icon: Star, title: "Reviews and ratings", body: "Both sides can review each other after working together." },
  { icon: History, title: "Partnership history", body: "Completed partnerships build a visible track record." },
  { icon: UsersRound, title: "Community-driven growth", body: "Report tools and moderation keep the marketplace healthy." },
];

export function Trust({ samples }: { samples: ProfileView[] }) {
  return (
    <section className="border-y border-line bg-white py-20 sm:py-24">
      <div className="container-page">
        <SectionHeading eyebrow="Trust & community" title="Built for Meaningful Business Partnerships." />
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-14">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex gap-3.5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy-50">
                    <Icon className="size-[18px] text-navy-700" />
                  </span>
                  <div>
                    <h3 className="font-sans text-sm font-semibold tracking-normal text-navy-900">{p.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-subtle">{p.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {samples.map((p) => (
                <ProfileCard key={p.id} profile={p} showSave={false} />
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">
              Illustrative sample profiles from MarketIn&apos;s demo environment. Names and figures are fictional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
