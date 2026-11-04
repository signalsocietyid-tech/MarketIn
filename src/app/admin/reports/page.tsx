import Link from "next/link";
import { Briefcase, Flag, UserRound } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, type BadgeTone, Card, EmptyState, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { AccountStatusBadge } from "@/components/shared/status-badge";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { ReportActions } from "@/components/admin/report-actions";
import { flatParams, oneOf } from "@/components/admin/search-params";
import { getAdminReports } from "@/lib/data/admin-queries";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata = { title: "Reports" };

const STATUSES = ["open", "resolved", "dismissed"] as const;
const STATUS_TONE: Record<(typeof STATUSES)[number], BadgeTone> = { open: "warning", resolved: "success", dismissed: "neutral" };

export default async function AdminReportsPage(props: PageProps<"/admin/reports">) {
  const sp = await props.searchParams;
  const status = oneOf(sp, "status", STATUSES);
  const params = flatParams(sp);
  const { rows, counts } = await getAdminReports({ status });

  return (
    <>
      <PageHeader
        title="Reports"
        description="Reports submitted by members about profiles and listings. Moderate the target, then resolve or dismiss the report."
      />

      <FilterTabs
        className="mb-4"
        pathname="/admin/reports"
        param="status"
        current={status}
        params={params}
        tabs={[
          { label: "All", count: counts.all },
          { value: "open", label: "Open", count: counts.open },
          { value: "resolved", label: "Resolved", count: counts.resolved },
          { value: "dismissed", label: "Dismissed", count: counts.dismissed },
        ]}
      />

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={Flag}
            title={status === "open" ? "No open reports" : "No reports here"}
            description={status === "open" ? "The moderation queue is clear." : "Reports matching this filter will appear here."}
          />
        ) : (
          <Table className="min-w-[1080px]">
            <THead>
              <tr>
                <Th>Target</Th>
                <Th>Reason</Th>
                <Th>Reporter</Th>
                <Th>Status</Th>
                <Th>Reported</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </THead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.id} className="align-top">
                  <Td className="align-top">
                    <div className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-navy-50 text-navy-700">
                        {r.targetType === "user" ? <UserRound className="size-3.5" /> : <Briefcase className="size-3.5" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                          {r.targetType === "user" ? "User" : "Opportunity"}
                        </p>
                        {r.target.href ? (
                          <Link href={r.target.href} className="block max-w-64 truncate font-medium hover:underline">
                            {r.target.label}
                          </Link>
                        ) : (
                          <p className="font-medium text-muted">{r.target.label}</p>
                        )}
                        <div className="mt-1 flex flex-wrap gap-1">
                          {r.target.userStatus && r.target.userStatus !== "active" && <AccountStatusBadge status={r.target.userStatus} />}
                          {r.target.opportunityFlagged && (
                            <Badge tone="danger">
                              <Flag /> Listing flagged
                            </Badge>
                          )}
                          {r.target.opportunityStatus === "closed" && <Badge tone="neutral">Listing closed</Badge>}
                        </div>
                      </div>
                    </div>
                  </Td>
                  <Td className="max-w-80 align-top">
                    <p className="font-medium">{r.reason}</p>
                    {r.details ? (
                      <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">{r.details}</p>
                    ) : (
                      <p className="mt-0.5 text-[13px] text-muted">No details provided</p>
                    )}
                  </Td>
                  <Td className="align-top">
                    {r.reporter.id ? (
                      <Link href={`/profiles/${r.reporter.id}`} className="text-subtle hover:text-ink hover:underline">
                        {r.reporter.name}
                      </Link>
                    ) : (
                      <span className="text-muted">{r.reporter.name}</span>
                    )}
                  </Td>
                  <Td className="align-top">
                    <Badge tone={STATUS_TONE[r.status]}>{r.status[0].toUpperCase() + r.status.slice(1)}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap align-top text-subtle" title={formatDate(r.createdAt)}>
                    {timeAgo(r.createdAt)}
                  </Td>
                  <Td className="align-top">
                    <ReportActions
                      report={{ id: r.id, status: r.status, targetType: r.targetType, targetId: r.targetId, target: r.target }}
                    />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
