import Link from "next/link";
import { ArrowRight, CalendarClock, Lock, MapPin, Sparkles, Target, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, Badge } from "@/components/ui/primitives";
import { ApplicationStatusBadge, OpportunityStatusBadge, VerifiedMark } from "@/components/shared/status-badge";
import { COMPENSATION_LABEL } from "@/lib/constants";
import type { InboxItem } from "@/lib/data/dashboard-queries";
import { cn, daysUntil, formatDate, timeAgo } from "@/lib/utils";

export function InboxItemRow({ item }: { item: InboxItem }) {
  const { opportunity: o, proposal, locked, reason, section } = item;
  const left = daysUntil(o.deadline);
  const open = o.status === "open";

  return (
    <li className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-start">
      <Avatar name={o.companyName} src={o.businessLogo} size={40} square className="hidden sm:inline-flex" />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-[13px] font-medium text-subtle">
          <span className="truncate">{o.companyName}</span>
          {o.businessVerified && <VerifiedMark className="size-3.5" />}
          <span className="text-muted">· {timeAgo(o.createdAt)}</span>
        </p>
        <h3 className="mt-0.5 font-sans text-[15px] font-semibold leading-snug tracking-normal text-ink">
          <Link href={`/opportunities/${o.id}`} className="hover:text-brand-700 hover:underline underline-offset-2">
            {o.title}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone={section === "agency" ? "navy" : section === "services" ? "brand" : "outline"}>
            <Target /> {reason}
          </Badge>
          <Badge tone="neutral">{o.typeLabel}</Badge>
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
          {!open && <OpportunityStatusBadge status={o.status} />}
        </div>

        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-subtle">
          <div className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-muted" />
            <dt className="sr-only">Location</dt>
            <dd>
              {o.location}
              {o.remote && " · Remote"}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Wallet className="size-3.5 text-muted" />
            <dt className="sr-only">Compensation</dt>
            <dd className={cn(locked && "select-none blur-[3px]")}>
              {COMPENSATION_LABEL[o.compensationModel]} · {o.compensationDetail}
            </dd>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5 text-muted" />
            <dt className="sr-only">Applicants</dt>
            <dd>{o.applicants} applicants</dd>
          </div>
          <div className={cn("flex items-center gap-1.5", open && left <= 7 && left >= 0 && "font-medium text-warning-700")}>
            <CalendarClock className="size-3.5 text-muted" />
            <dt className="sr-only">Deadline</dt>
            <dd>{!open || left < 0 ? `Closed ${formatDate(o.deadline)}` : left === 0 ? "Closes today" : `${left}d left`}</dd>
          </div>
        </dl>
      </div>

      <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
        {proposal ? (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">
                {proposal.count > 1 ? `${proposal.count} proposals` : "Proposed"} {timeAgo(proposal.lastAt)}
              </span>
              <ApplicationStatusBadge status={proposal.status} />
            </div>
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/applications">Track</Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/opportunities/${o.id}`}>
                  {open ? "View & propose" : "View listing"} <ArrowRight />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            {locked && <span className="text-xs text-muted">Pro plan required to propose</span>}
            <Button asChild size="sm" variant={locked ? "secondary" : "primary"}>
              <Link href={`/opportunities/${o.id}`}>
                View &amp; propose <ArrowRight />
              </Link>
            </Button>
          </>
        )}
      </div>
    </li>
  );
}
