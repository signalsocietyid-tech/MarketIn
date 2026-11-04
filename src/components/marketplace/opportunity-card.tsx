import Link from "next/link";
import { CalendarClock, Lock, MapPin, Sparkles, Users, Wallet } from "lucide-react";
import { Avatar, Badge } from "@/components/ui/primitives";
import { VerifiedMark } from "@/components/shared/status-badge";
import { SaveButton } from "./save-button";
import { CATEGORY_META, COMPENSATION_LABEL } from "@/lib/constants";
import type { OpportunityView } from "@/lib/data/queries";
import { cn, daysUntil, timeAgo } from "@/lib/utils";

const CATEGORY_TONE = {
  sales: "bg-navy-50 text-navy-700",
  affiliate: "bg-blue-50 text-blue-700",
  kol: "bg-brand-50 text-brand-800",
  agency: "bg-violet-50 text-violet-700",
} as const;

export function OpportunityCard({
  opportunity: o,
  saved = false,
  signedIn = false,
  locked = false,
}: {
  opportunity: OpportunityView;
  saved?: boolean;
  signedIn?: boolean;
  locked?: boolean;
}) {
  const left = daysUntil(o.deadline);
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-navy-100 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={o.companyName} src={o.businessLogo} size={40} square />
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate text-[13px] font-medium text-subtle">
              <span className="truncate">{o.companyName}</span>
              {o.businessVerified && <VerifiedMark className="size-3.5" />}
            </p>
            <h3 className="font-sans text-[15px] font-semibold leading-snug tracking-normal text-ink">
              <Link href={`/opportunities/${o.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                {o.title}
              </Link>
            </h3>
          </div>
        </div>
        <SaveButton targetType="opportunity" targetId={o.id} initialSaved={saved} signedIn={signedIn} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", CATEGORY_TONE[o.category])}>{o.typeLabel}</span>
        {o.featured && (
          <Badge tone="brand">
            <Sparkles /> Featured
          </Badge>
        )}
        {o.premium && (
          <Badge tone="navy">
            <Lock /> Premium
          </Badge>
        )}
        {o.remote && <Badge tone="outline">Remote</Badge>}
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-subtle">{o.description}</p>

      <dl className="mt-4 grid grid-cols-1 gap-2 text-[13px] text-subtle sm:grid-cols-2">
        <div className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-muted" />
          <dt className="sr-only">Location</dt>
          <dd className="truncate">{o.location}</dd>
        </div>
        <div className="flex items-center gap-1.5">
          <Wallet className="size-3.5 text-muted" />
          <dt className="sr-only">Compensation</dt>
          <dd className="truncate">{COMPENSATION_LABEL[o.compensationModel]}</dd>
        </div>
      </dl>

      <div className="mt-auto pt-4">
        <div className="rounded-lg bg-canvas px-3 py-2 text-[13px] font-medium text-navy-800">
          {locked ? (
            <span className="flex items-center gap-1.5 text-subtle">
              <Lock className="size-3.5" /> Terms visible to Pro members
            </span>
          ) : (
            o.compensationDetail
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" /> {o.applicants} applicants · {timeAgo(o.createdAt)}
          </span>
          <span className={cn("flex items-center gap-1", left <= 7 && left >= 0 && "font-medium text-warning-700")}>
            <CalendarClock className="size-3.5" />
            {left < 0 ? "Closed" : left === 0 ? "Closes today" : `${left}d left`}
          </span>
        </div>
      </div>
      <span className="sr-only">{CATEGORY_META[o.category].label}</span>
    </article>
  );
}
