import Link from "next/link";
import { Briefcase, Flag, Star } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge, Card, EmptyState, Table, Td, Th, THead, Tr } from "@/components/ui/primitives";
import { OpportunityStatusBadge } from "@/components/shared/status-badge";
import { FilterBar } from "@/components/admin/filter-bar";
import { FilterTabs } from "@/components/admin/filter-tabs";
import { OpportunityActions } from "@/components/admin/opportunity-actions";
import { flatParams, oneOf, param } from "@/components/admin/search-params";
import { getAdminOpportunities } from "@/lib/data/admin-queries";
import { CATEGORY_META } from "@/lib/constants";
import type { MarketCategory, OpportunityStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Opportunities" };

const CATEGORIES = Object.keys(CATEGORY_META) as MarketCategory[];
const STATUSES: OpportunityStatus[] = ["open", "paused", "closed"];

export default async function AdminOpportunitiesPage(props: PageProps<"/admin/opportunities">) {
  const sp = await props.searchParams;
  const filters = {
    q: param(sp, "q"),
    category: oneOf(sp, "category", CATEGORIES),
    status: oneOf(sp, "status", STATUSES),
    flagged: oneOf(sp, "flagged", ["1", "0"] as const),
  };
  const params = flatParams(sp);
  const { rows, totals } = await getAdminOpportunities(filters);

  return (
    <>
      <PageHeader
        title="Opportunities"
        description={`${totals.all} listings · ${totals.open} open · ${totals.featured} featured · ${totals.flagged} flagged`}
      />

      <div className="mb-4 space-y-3">
        <FilterTabs
          pathname="/admin/opportunities"
          param="flagged"
          current={filters.flagged}
          params={params}
          tabs={[
            { label: "All listings", count: totals.all },
            { value: "1", label: "Flagged", count: totals.flagged },
            { value: "0", label: "Not flagged", count: totals.all - totals.flagged },
          ]}
        />
        <FilterBar
          values={params}
          searchPlaceholder="Search title, company, industry"
          resetKeys={["q", "category", "status"]}
          selects={[
            { name: "category", label: "Category", options: CATEGORIES.map((c) => ({ value: c, label: CATEGORY_META[c].label })) },
            { name: "status", label: "Status", options: STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })) },
          ]}
        />
      </div>

      <Card>
        <div className="border-b border-line px-5 py-3 text-[13px] text-subtle">
          Showing <span className="font-semibold text-ink">{rows.length}</span> {rows.length === 1 ? "listing" : "listings"}. Flagged
          listings are hidden from marketplace search until the flag is cleared.
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={Briefcase} title="No opportunities match these filters" description="Try a different search or clear the filters." />
        ) : (
          <Table className="min-w-[1080px]">
            <THead>
              <tr>
                <Th>Opportunity</Th>
                <Th>Company</Th>
                <Th>Type</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Moderation</Th>
                <Th className="text-right">Applicants</Th>
                <Th>Created</Th>
                <Th className="text-right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </THead>
            <tbody>
              {rows.map((o) => (
                <Tr key={o.id} className={o.flagged ? "bg-danger-50/40" : undefined}>
                  <Td>
                    <Link href={`/opportunities/${o.id}`} className="block max-w-72 truncate font-medium hover:underline">
                      {o.title}
                    </Link>
                    {o.premium && <span className="text-[11px] font-medium text-brand-700">Premium listing</span>}
                  </Td>
                  <Td>
                    <Link href={`/profiles/${o.businessId}`} className="text-subtle hover:text-ink hover:underline">
                      {o.companyName}
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap text-subtle">{o.typeLabel}</Td>
                  <Td>
                    <Badge tone="outline">{CATEGORY_META[o.category].short}</Badge>
                  </Td>
                  <Td>
                    <OpportunityStatusBadge status={o.status} />
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      {o.featured && (
                        <Badge tone="brand">
                          <Star /> Featured
                        </Badge>
                      )}
                      {o.flagged && (
                        <Badge tone="danger">
                          <Flag /> Flagged
                        </Badge>
                      )}
                      {!o.featured && !o.flagged && <span className="text-xs text-muted">None</span>}
                    </div>
                  </Td>
                  <Td className="text-right tabular-nums">
                    <Link href={`/admin/applications?q=${encodeURIComponent(o.title)}`} className="hover:underline">
                      {o.applicants}
                    </Link>
                  </Td>
                  <Td className="whitespace-nowrap text-subtle">{formatDate(o.createdAt)}</Td>
                  <Td className="text-right">
                    <OpportunityActions
                      opportunity={{ id: o.id, title: o.title, businessId: o.businessId, status: o.status, featured: o.featured, flagged: o.flagged }}
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
