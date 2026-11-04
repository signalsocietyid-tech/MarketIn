import Link from "next/link";
import { ListChecks } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Avatar, Card, EmptyState, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/admin/filter-bar";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { flatParams, oneOf, param } from "@/components/admin/search-params";
import { getAdminApplications } from "@/lib/data/admin-queries";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUSES, SEGMENT_LABEL } from "@/lib/constants";
import type { Role } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata = { title: "Applications" };

export default async function AdminApplicationsPage(props: PageProps<"/admin/applications">) {
  const sp = await props.searchParams;
  const filters = { q: param(sp, "q"), status: oneOf(sp, "status", APPLICATION_STATUSES) };
  const params = flatParams(sp);
  const { rows, counts, total } = await getAdminApplications(filters);

  return (
    <>
      <PageHeader
        title="Applications"
        description="Monitor every application across the marketplace. Status changes are made by the business that owns the listing."
      />

      <div className="mb-4 space-y-3">
        <FilterTabs
          pathname="/admin/applications"
          param="status"
          current={filters.status}
          params={params}
          tabs={[{ label: "All", count: total }, ...APPLICATION_STATUSES.map((s) => ({ value: s, label: APPLICATION_STATUS_LABEL[s], count: counts[s] }))]}
        />
        <FilterBar values={params} searchPlaceholder="Search applicant, opportunity, company" resetKeys={["q", "status"]} />
      </div>

      <Card>
        <div className="border-b border-line px-5 py-3 text-[13px] text-subtle">
          Showing <span className="font-semibold text-ink">{rows.length}</span> of {total} applications
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={ListChecks} title="No applications match these filters" description="Try a different search or status." />
        ) : (
          <Table className="min-w-[960px]">
            <THead>
              <tr>
                <Th>Applicant</Th>
                <Th>Opportunity</Th>
                <Th>Company</Th>
                <Th>Status</Th>
                <Th>Submitted</Th>
                <Th>Updated</Th>
              </tr>
            </THead>
            <tbody>
              {rows.map((a) => (
                <Tr key={a.id}>
                  <Td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.applicant.name} src={a.applicant.avatarUrl} size={28} square={a.applicant.role === "agency"} />
                      <div className="min-w-0">
                        <Link href={`/profiles/${a.applicant.id}`} className="block max-w-56 truncate font-medium hover:underline">
                          {a.applicant.name}
                        </Link>
                        <p className="max-w-56 truncate text-xs text-subtle">
                          {SEGMENT_LABEL[a.applicant.role as Role] ?? a.applicant.role}
                          {a.talentName && ` · for ${a.talentName}`}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <Link href={`/opportunities/${a.opportunity.id}`} className="block max-w-72 truncate hover:underline">
                      {a.opportunity.title}
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`/profiles/${a.opportunity.businessId}`} className="text-subtle hover:text-ink hover:underline">
                      {a.opportunity.companyName}
                    </Link>
                  </Td>
                  <Td>
                    <ApplicationStatusBadge status={a.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-subtle">{formatDate(a.createdAt)}</Td>
                  <Td className="whitespace-nowrap text-subtle" title={formatDate(a.updatedAt)}>
                    {timeAgo(a.updatedAt)}
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
