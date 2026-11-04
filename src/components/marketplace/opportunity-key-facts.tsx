import { CalendarClock, CalendarDays, Clock, GraduationCap, Lock, MapPin, Share2, Users, Wallet, Coins } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/primitives";
import { SocialIcon } from "@/components/brand/social-icons";
import { COMPENSATION_LABEL, EXPERIENCE_LEVELS, PLATFORM_LABEL } from "@/lib/constants";
import type { OpportunityView } from "@/lib/data/queries";
import { cn, daysUntil, formatDate, formatIDRShort } from "@/lib/utils";
import { LOCKED_PLACEHOLDER } from "./mask";

function budgetLabel(min?: number, max?: number) {
  if (min !== undefined && max !== undefined) return min === max ? formatIDRShort(max) : `${formatIDRShort(min)} – ${formatIDRShort(max)}`;
  if (max !== undefined) return `Up to ${formatIDRShort(max)}`;
  if (min !== undefined) return `From ${formatIDRShort(min)}`;
  return null;
}

export function OpportunityKeyFacts({ opportunity: o, locked }: { opportunity: OpportunityView; locked: boolean }) {
  const left = daysUntil(o.deadline);
  const budget = budgetLabel(o.budgetMin, o.budgetMax);
  const experience = EXPERIENCE_LEVELS.find((e) => e.value === o.experienceLevel)?.label ?? "Any experience";

  const facts: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode; sensitive?: boolean }[] = [
    { icon: Wallet, label: "Compensation model", value: COMPENSATION_LABEL[o.compensationModel] },
    { icon: Coins, label: "Commission / fee", value: o.compensationDetail, sensitive: true },
  ];
  if (budget) facts.push({ icon: Wallet, label: "Budget", value: budget, sensitive: true });
  facts.push(
    { icon: MapPin, label: "Location", value: o.remote ? `${o.location} · Remote-friendly` : o.location },
    { icon: GraduationCap, label: "Experience", value: experience },
  );
  if (o.platforms?.length) {
    facts.push({
      icon: Share2,
      label: "Platforms",
      value: (
        <span className="flex flex-wrap gap-1.5">
          {o.platforms.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5 text-xs">
              <SocialIcon platform={p} className="size-3.5 text-subtle" />
              {PLATFORM_LABEL[p]}
            </span>
          ))}
        </span>
      ),
    });
  }
  facts.push(
    { icon: Clock, label: "Duration", value: o.duration },
    {
      icon: CalendarClock,
      label: "Deadline",
      value: (
        <>
          {formatDate(o.deadline)}{" "}
          <span className={cn("text-subtle", left >= 0 && left <= 7 && "font-medium text-warning-700")}>
            ({left < 0 ? "closed" : left === 0 ? "closes today" : `${left} ${left === 1 ? "day" : "days"} left`})
          </span>
        </>
      ),
    },
    { icon: Users, label: "Applicants", value: o.applicants.toLocaleString("en") },
    { icon: CalendarDays, label: "Posted", value: formatDate(o.createdAt) },
  );

  return (
    <Card>
      <CardHeader title="Key facts" />
      <dl className="divide-y divide-line px-5">
        {facts.map((f) => {
          const Icon = f.icon;
          const hide = f.sensitive && locked;
          return (
            <div key={f.label} className="flex items-start gap-3 py-3 text-[13px]">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <dt className="text-subtle">{f.label}</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {hide ? (
                    <span className="flex items-center gap-1.5">
                      {/* Placeholder only: the real terms are never sent to non-entitled viewers. */}
                      <span className="select-none blur-[4px]" aria-hidden>
                        {LOCKED_PLACEHOLDER}
                      </span>
                      <Lock className="size-3.5 text-muted" />
                      <span className="sr-only">Available on Pro plans</span>
                    </span>
                  ) : (
                    f.value
                  )}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </Card>
  );
}
