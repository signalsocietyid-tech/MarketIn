import type { Metadata } from "next";
import Link from "next/link";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Avatar, Card, EmptyState, Table, THead, Th, Td, Tr } from "@/components/ui/primitives";
import { ApplicationStatusBadge, VerifiedMark } from "@/components/shared/status-badge";
import { WithdrawButton } from "@/components/dashboard/withdraw-button";
import { requireRole } from "@/lib/auth/session";
import { getApplicationsByApplicant, getApplicationsForBusiness, type ApplicationView } from "@/lib/data/queries";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/types";
import { cn, formatDate, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Applications" };

export default async function ApplicationsPage(props: PageProps<"/dashboard/applications">) {
  const user = await requireRole(["business", "sales", "creator", "agency"], "/dashboard/applications");
  const sp = await props.searchParams;
  const status = APPLICATION_STATUSES.includes(sp.status as ApplicationStatus) ? (sp.status as ApplicationStatus) : undefined;
  const isBusiness = user.role === "business";
  const all = isBusiness ? await getApplicationsForBusiness(user.id) : await getApplicationsByApplicant(user.id);
  const list = status ? all.filter((a) => a.status === status) : all;

  const title = isBusiness ? "Applications received" : user.role === "agency" ? "Proposals" : "My applications";
  const description = isBusiness
    ? "Every application across your opportunities. Open a listing to review applicants and update statuses."
    : "Track the status of everything you've applied to.";

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        actions={
          !isBusiness && (
            <Button asChild>
              <Link href="/marketplace">Browse opportunities</Link>
            </Button>
          )
        }
      />
      <div className="mb-4 flex gap-1 overflow-x-auto scrollbar-none">
        <FilterLink href="/dashboard/applications" active={!status} label="All" count={all.length} />
        {APPLICATION_STATUSES.map((s) => (
          <FilterLink key={s} href={`/dashboard/applications?status=${s}`} active={status === s} label={APPLICATION_STATUS_LABEL[s]} count={all.filter((a) => a.status === s).length} />
        ))}
      </div>
      <Card>
        {list.length ? (
          isBusiness ? <BusinessTable list={list} /> : <PartnerTable list={list} />
        ) : (
          <EmptyState
            icon={ListChecks}
            title={status ? `No ${APPLICATION_STATUS_LABEL[status].toLowerCase()} applications` : "No applications yet"}
            description={isBusiness ? "Applications will appear here once partners apply to your opportunities." : "Find an opportunity that fits and send your first application."}
            action={
              <Button asChild size="sm" variant="secondary">
                <Link href={isBusiness ? "/dashboard/opportunities/new" : "/marketplace"}>{isBusiness ? "Publish opportunity" : "Explore marketplace"}</Link>
              </Button>
            }
          />
        )}
      </Card>
    </>
  );
}

function FilterLink({ href, active, label, count }: { href: string; active: boolean; label: string; count: number }) {
  return (
    <Link
      href={href}
      className={cn(
        "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
        active ? "bg-white text-navy-900 shadow-xs ring-1 ring-line" : "text-subtle hover:text-ink",
      )}
    >
      {label} <span className="ml-1 text-muted">{count}</span>
    </Link>
  );
}

function BusinessTable({ list }: { list: ApplicationView[] }) {
  return (
    <Table>
      <THead>
        <tr>
          <Th>Applicant</Th>
          <Th>Opportunity</Th>
          <Th>Proposed terms</Th>
          <Th>Status</Th>
          <Th className="text-right">Received</Th>
          <Th />
        </tr>
      </THead>
      <tbody>
        {list.map((a) => (
          <Tr key={a.id}>
            <Td>
              <div className="flex items-center gap-3">
                <Avatar name={a.applicant?.name ?? "?"} size={32} />
                <div className="min-w-0">
                  <Link href={`/profiles/${a.applicantId}`} className="flex items-center gap-1 font-medium text-ink hover:text-brand-700">
                    {a.applicant?.name} {a.applicant?.verified && <VerifiedMark className="size-3.5" />}
                  </Link>
                  <p className="text-xs text-muted">{a.talentName ? `For ${a.talentName}` : a.applicant?.roleLabel}</p>
                </div>
              </div>
            </Td>
            <Td className="max-w-56 truncate text-subtle">{a.opportunity.title}</Td>
            <Td className="text-subtle">{a.proposedRate ?? "—"}</Td>
            <Td>
              <ApplicationStatusBadge status={a.status} />
            </Td>
            <Td className="whitespace-nowrap text-right text-subtle">{timeAgo(a.createdAt)}</Td>
            <Td className="text-right">
              <Button asChild variant="secondary" size="sm">
                <Link href={`/dashboard/opportunities/${a.opportunityId}`}>Review</Link>
              </Button>
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}

function PartnerTable({ list }: { list: ApplicationView[] }) {
  return (
    <Table>
      <THead>
        <tr>
          <Th>Opportunity</Th>
          <Th>Company</Th>
          <Th>Status</Th>
          <Th>Submitted</Th>
          <Th>Last update</Th>
          <Th />
        </tr>
      </THead>
      <tbody>
        {list.map((a) => (
          <Tr key={a.id}>
            <Td>
              <Link href={`/opportunities/${a.opportunityId}`} className="font-medium text-ink hover:text-brand-700">
                {a.opportunity.title}
              </Link>
              {a.talentName && <p className="text-xs text-muted">On behalf of {a.talentName}</p>}
            </Td>
            <Td className="text-subtle">
              <Link href={`/profiles/${a.opportunity.businessId}`} className="hover:text-ink">
                {a.opportunity.companyName}
              </Link>
            </Td>
            <Td>
              <ApplicationStatusBadge status={a.status} />
            </Td>
            <Td className="whitespace-nowrap text-subtle">{formatDate(a.createdAt)}</Td>
            <Td className="whitespace-nowrap text-subtle">{timeAgo(a.updatedAt)}</Td>
            <Td className="text-right">
              {(a.status === "pending" || a.status === "under_review") && <WithdrawButton id={a.id} title={a.opportunity.title} />}
              {a.status === "accepted" && (
                <Button asChild variant="soft" size="sm">
                  <Link href="/dashboard/partnerships">Partnership</Link>
                </Button>
              )}
            </Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
