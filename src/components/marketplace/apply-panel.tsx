import Link from "next/link";
import { ArrowRight, Ban, Building2, CalendarClock, Lock, Settings2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import type { OpportunityView } from "@/lib/data/queries";
import type { Application, Role, Talent } from "@/lib/types";
import { cn, daysUntil, formatDate } from "@/lib/utils";
import { ApplyDialog } from "./apply-dialog";
import { SaveButton } from "./save-button";
import { ReportDialog } from "./report-dialog";

const TALENT_TYPE_LABEL: Record<Talent["type"], string> = {
  sales: "Sales",
  creator: "Creator",
  affiliate: "Affiliate",
};

type Props = {
  opportunity: OpportunityView;
  viewer: { id: string; role: Role } | null;
  /** Premium listing and the viewer's plan doesn't include premium opportunities. */
  locked: boolean;
  applications: Application[];
  talents: Talent[];
  usage?: { used: number; limit: number };
  saved: boolean;
};

export function ApplyPanel({ opportunity: o, viewer, locked, applications, talents, usage, saved }: Props) {
  const left = daysUntil(o.deadline);
  const closed = o.status !== "open" || left < 0;
  const isOwner = viewer?.id === o.businessId;
  const isAgency = viewer?.role === "agency";
  const nextHref = `/opportunities/${o.id}`;
  const loginHref = `/login?next=${encodeURIComponent(nextHref)}`;

  // Agencies can submit one application per talent; work out what's still available.
  const usedTalentIds = new Set(applications.map((a) => a.talentId).filter(Boolean));
  const availableTalents = talents
    .filter((t) => t.status !== "inactive" && !usedTalentIds.has(t.id))
    .map((t) => ({ id: t.id, label: `${t.name} · ${TALENT_TYPE_LABEL[t.type]}, ${t.specialty}` }));
  const allowAgencySelf = isAgency && applications.length === 0;
  const canApplyMore = isAgency ? allowAgencySelf || availableTalents.length > 0 : applications.length === 0;

  let body: React.ReactNode;

  if (isOwner) {
    body = (
      <PanelState icon={Settings2} title="This is your listing" text="Review applicants, edit details or change the listing status.">
        <Button asChild size="lg" className="w-full">
          <Link href={`/dashboard/opportunities/${o.id}`}>
            Manage listing <ArrowRight />
          </Link>
        </Button>
      </PanelState>
    );
  } else if (!viewer) {
    body = (
      <PanelState
        icon={locked ? Lock : undefined}
        title={closed ? "Applications closed" : "Interested in this opportunity?"}
        text={
          closed
            ? "This listing is no longer accepting applications. Create an account to get matched with similar ones."
            : locked
              ? "This is a premium listing. Sign in with a Pro plan to view full terms and apply."
              : "Sign in to apply. It's free to create a partner account."
        }
      >
        <div className="space-y-2">
          <Button asChild size="lg" className="w-full">
            <Link href={loginHref}>Sign in to apply</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="w-full">
            <Link href="/register">Create free account</Link>
          </Button>
        </div>
      </PanelState>
    );
  } else if (viewer.role === "business") {
    body = (
      <PanelState
        icon={Building2}
        title="Business accounts can't apply"
        text="Looking for partners instead? Publish your own opportunity and let partners come to you."
      >
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/dashboard/opportunities/new">Post an opportunity</Link>
        </Button>
      </PanelState>
    );
  } else if (viewer.role === "admin") {
    body = (
      <PanelState icon={ShieldCheck} title="Admin view" text="Administrators can review and moderate listings from the admin console.">
        <Button asChild variant="secondary" size="lg" className="w-full">
          <Link href="/admin">Open admin console</Link>
        </Button>
      </PanelState>
    );
  } else if (applications.length > 0 && (closed || locked || !canApplyMore)) {
    body = <AppliedList applications={applications} talents={talents} />;
  } else if (closed) {
    body = (
      <PanelState
        icon={Ban}
        title={o.status === "paused" ? "Applications paused" : "Applications closed"}
        text={
          o.status === "paused"
            ? "The business has temporarily paused this listing. Save it to check back later."
            : "This opportunity is no longer accepting applications."
        }
      >
        <Button disabled size="lg" className="w-full">
          Apply now
        </Button>
      </PanelState>
    );
  } else if (locked) {
    body = (
      <PanelState
        icon={Lock}
        title="Premium opportunity"
        text="Premium listings are available on Pro plans. Upgrade to see full compensation details and apply."
      >
        <Button asChild size="lg" className="w-full">
          <Link href="/pricing">Upgrade to apply</Link>
        </Button>
      </PanelState>
    );
  } else {
    body = (
      <div className="space-y-4">
        {applications.length > 0 && <AppliedList applications={applications} talents={talents} compact />}
        <ApplyDialog
          opportunityId={o.id}
          opportunityTitle={o.title}
          companyName={o.companyName}
          isAgency={isAgency}
          allowAgencySelf={allowAgencySelf}
          talentOptions={availableTalents}
          usage={usage}
          triggerLabel={applications.length > 0 ? "Apply for another talent" : "Apply now"}
          triggerVariant={applications.length > 0 ? "secondary" : "primary"}
        />
        {usage && (
          <p className="text-center text-xs text-muted">
            {usage.used} of {usage.limit} monthly applications used
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="text-subtle">Deadline</span>
        <span className={cn("flex items-center gap-1.5 font-medium text-ink", left >= 0 && left <= 7 && "text-warning-700")}>
          <CalendarClock className="size-3.5" />
          {formatDate(o.deadline)}
          <span className="font-normal text-subtle">· {left < 0 ? "closed" : left === 0 ? "closes today" : `${left}d left`}</span>
        </span>
      </div>
      <div className="mt-4 border-t border-line pt-4">{body}</div>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-4">
        {!isOwner && <SaveButton targetType="opportunity" targetId={o.id} initialSaved={saved} signedIn={!!viewer} variant="full" />}
        {!isOwner && (
          <ReportDialog targetType="opportunity" targetId={o.id} signedIn={!!viewer} loginHref={loginHref} subject={o.title} />
        )}
        {isOwner && <p className="text-xs text-muted">Partners can save and report listings from this panel.</p>}
      </div>
    </Card>
  );
}

function PanelState({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex gap-3">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-subtle ring-1 ring-line">
            <Icon className="size-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-navy-900">{title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-subtle">{text}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function AppliedList({ applications, talents, compact }: { applications: Application[]; talents: Talent[]; compact?: boolean }) {
  return (
    <div>
      {!compact && <p className="text-[15px] font-semibold text-navy-900">You&apos;ve applied</p>}
      <ul className={cn("space-y-2", !compact && "mt-3")}>
        {applications.map((a) => {
          const talent = a.talentId ? talents.find((t) => t.id === a.talentId) : undefined;
          return (
            <li key={a.id} className="flex items-center justify-between gap-3 rounded-lg bg-canvas px-3 py-2 text-[13px]">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{talent ? talent.name : "Your application"}</span>
                <span className="text-xs text-muted">Sent {formatDate(a.createdAt)}</span>
              </span>
              <ApplicationStatusBadge status={a.status} />
            </li>
          );
        })}
      </ul>
      <Button asChild variant="link" className="mt-3">
        <Link href="/dashboard/applications">
          Track in your dashboard <ArrowRight />
        </Link>
      </Button>
    </div>
  );
}
