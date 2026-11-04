import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState, Table, THead, Th, Td, Tr } from "@/components/ui/primitives";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { OpportunityActions } from "@/components/dashboard/opportunity-actions";
import { requireRole } from "@/lib/auth/session";
import { getOpportunitiesByBusiness } from "@/lib/data/queries";
import { getUsage } from "@/lib/permissions";
import { CATEGORY_META } from "@/lib/constants";
import { cn, daysUntil, formatDate } from "@/lib/utils";
import type { OpportunityStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Opportunities" };

const FILTERS: { id: "all" | OpportunityStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "paused", label: "Paused" },
  { id: "closed", label: "Closed" },
];

export default async function OpportunitiesPage(props: PageProps<"/dashboard/opportunities">) {
  const user = await requireRole(["business"], "/dashboard/opportunities");
  const sp = await props.searchParams;
  const status = FILTERS.some((f) => f.id === sp.status) ? (sp.status as "all" | OpportunityStatus) : "all";
  const [all, usage] = await Promise.all([getOpportunitiesByBusiness(user.id), getUsage(user)]);
  const list = status === "all" ? all : all.filter((o) => o.status === status);
  const meter = usage.find((m) => m.key === "activeOpportunities");
  const atLimit = !!meter && meter.used >= meter.limit;

  return (
    <>
      <PageHeader
        title="Opportunities"
        description={meter ? `${meter.used} of ${meter.limit} active listings used on your plan.` : undefined}
        actions={
          atLimit ? (
            <Button asChild variant="outline">
              <Link href="/dashboard/billing">Limit reached — upgrade</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/dashboard/opportunities/new">
                <Plus /> New opportunity
              </Link>
            </Button>
          )
        }
      />
      <div className="mb-4 flex gap-1 overflow-x-auto">
        {FILTERS.map((f) => {
          const count = f.id === "all" ? all.length : all.filter((o) => o.status === f.id).length;
          return (
            <Link
              key={f.id}
              href={f.id === "all" ? "/dashboard/opportunities" : `/dashboard/opportunities?status=${f.id}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium",
                status === f.id ? "bg-white text-navy-900 shadow-xs ring-1 ring-line" : "text-subtle hover:text-ink",
              )}
            >
              {f.label} <span className="ml-1 text-muted">{count}</span>
            </Link>
          );
        })}
      </div>
      <Card>
        {list.length ? (
          <Table>
            <THead>
              <tr>
                <Th>Opportunity</Th>
                <Th>Status</Th>
                <Th className="text-right">Applicants</Th>
                <Th className="text-right">Views</Th>
                <Th>Deadline</Th>
                <Th className="w-10" />
              </tr>
            </THead>
            <tbody>
              {list.map((o) => {
                const left = daysUntil(o.deadline);
                return (
                  <Tr key={o.id}>
                    <Td>
                      <Link href={`/dashboard/opportunities/${o.id}`} className="font-medium text-ink hover:text-brand-700">
                        {o.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge tone="outline">{o.typeLabel}</Badge>
                        <span className="text-xs text-muted">{CATEGORY_META[o.category].label} · {o.location}</span>
                        {o.premium && <Badge tone="navy">Premium</Badge>}
                        {o.flagged && <Badge tone="danger">Under review</Badge>}
                      </div>
                    </Td>
                    <Td>
                      <OpportunityStatusBadge status={o.status} />
                    </Td>
                    <Td className="text-right font-medium">{o.applicants}</Td>
                    <Td className="text-right text-subtle">{o.views}</Td>
                    <Td className="whitespace-nowrap text-subtle">
                      {formatDate(o.deadline)}
                      {o.status === "open" && <span className={cn("block text-xs", left <= 7 ? "text-warning-700" : "text-muted")}>{left < 0 ? "Passed" : `${left} days left`}</span>}
                    </Td>
                    <Td>
                      <OpportunityActions id={o.id} status={o.status} />
                    </Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            icon={Briefcase}
            title={status === "all" ? "No opportunities yet" : `No ${status} opportunities`}
            description="Publish a listing for sales partners, distributors, affiliates, creators or agencies."
            action={
              <Button asChild size="sm">
                <Link href="/dashboard/opportunities/new">Create opportunity</Link>
              </Button>
            }
          />
        )}
      </Card>
    </>
  );
}
