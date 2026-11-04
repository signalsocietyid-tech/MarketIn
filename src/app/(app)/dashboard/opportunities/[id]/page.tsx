import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Eye, MapPin, Pencil, Users, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card, CardHeader } from "@/components/ui/primitives";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { OpportunityActions } from "@/components/dashboard/opportunity-actions";
import { ApplicantReview, type ApplicantItem } from "@/components/dashboard/applicant-review";
import { requireRole } from "@/lib/auth/session";
import { getApplicationsForOpportunity, getOpportunity } from "@/lib/data/queries";
import { COMPENSATION_LABEL } from "@/lib/constants";
import { daysUntil, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage opportunity" };

export default async function ManageOpportunityPage(props: PageProps<"/dashboard/opportunities/[id]">) {
  const { id } = await props.params;
  const user = await requireRole(["business"], `/dashboard/opportunities/${id}`);
  const o = await getOpportunity(id);
  if (!o || o.businessId !== user.id) notFound();
  const apps = await getApplicationsForOpportunity(id);

  const items: ApplicantItem[] = apps.map((a) => ({
    id: a.id,
    status: a.status,
    message: a.message,
    proposedRate: a.proposedRate,
    createdAt: a.createdAt,
    talentName: a.talentName,
    applicant: a.applicant && {
      id: a.applicant.id,
      name: a.applicant.name,
      headline: a.applicant.headline,
      roleLabel: a.applicant.roleLabel,
      location: a.applicant.location,
      verified: a.applicant.verified,
      pro: a.applicant.pro,
      rating: a.applicant.rating,
      avatarUrl: a.applicant.avatarUrl,
    },
  }));
  const left = daysUntil(o.deadline);

  return (
    <>
      <Link href="/dashboard/opportunities" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-subtle hover:text-ink">
        <ArrowLeft className="size-4" /> All opportunities
      </Link>
      <PageHeader
        title={o.title}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <OpportunityStatusBadge status={o.status} />
            <Badge tone="outline">{o.typeLabel}</Badge>
            {o.premium && <Badge tone="navy">Premium</Badge>}
            {o.flagged && <Badge tone="danger">Hidden — under moderation review</Badge>}
          </span>
        }
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/dashboard/opportunities/${o.id}/edit`}>
                <Pencil /> Edit
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/opportunities/${o.id}`}>
                <Eye /> Public view
              </Link>
            </Button>
            <OpportunityActions id={o.id} status={o.status} />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <h2 className="mb-3 font-sans text-[15px] font-semibold tracking-normal text-ink">Applications</h2>
          <ApplicantReview applications={items} />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader title="Listing summary" />
            <dl className="space-y-3 p-5 text-sm">
              {[
                [Users, "Applicants", String(apps.length)],
                [Eye, "Views", String(o.views)],
                [MapPin, "Location", `${o.location}${o.remote ? " · Remote OK" : ""}`],
                [Wallet, COMPENSATION_LABEL[o.compensationModel], o.compensationDetail],
                [CalendarClock, "Deadline", `${formatDate(o.deadline)}${o.status === "open" ? ` (${left < 0 ? "passed" : `${left}d left`})` : ""}`],
              ].map(([Icon, label, value]) => {
                const I = Icon as typeof Users;
                return (
                  <div key={label as string} className="flex gap-3">
                    <I className="mt-0.5 size-4 shrink-0 text-muted" />
                    <div className="min-w-0">
                      <dt className="text-xs text-muted">{label as string}</dt>
                      <dd className="text-ink">{value as string}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </Card>
          <Card className="p-5 text-[13px] leading-relaxed text-subtle">
            Accepting an application creates a partnership you can track under{" "}
            <Link href="/dashboard/partnerships" className="font-medium text-brand-700 hover:underline">
              Partnerships
            </Link>
            . Applicants are notified whenever you change their status.
          </Card>
        </div>
      </div>
    </>
  );
}
