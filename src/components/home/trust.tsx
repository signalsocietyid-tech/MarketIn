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
    <section className="px-4 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading eyebrow="Trust & community" title="Built for Meaningful Business Partnerships." />
        <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="glass glass-interactive flex flex-col items-center rounded-[1.5rem] p-6 text-center">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
                  <Icon className="size-5" />
                </span>
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
