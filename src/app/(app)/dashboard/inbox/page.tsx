import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Inbox, Send, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/overlays";
import { InboxItemRow } from "@/components/dashboard/inbox-item";
import { requireRole } from "@/lib/auth/session";
import { getAgency } from "@/lib/data/queries";
import { getAgencyInbox, serviceCategory, type InboxItem } from "@/lib/data/dashboard-queries";
import { hasFeature } from "@/lib/permissions";

export const metadata: Metadata = { title: "Opportunity inbox" };

function ItemList({ items, empty }: { items: InboxItem[]; empty: React.ReactNode }) {
  if (!items.length) return <Card>{empty}</Card>;
  return (
    <Card>
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <InboxItemRow key={item.opportunity.id} item={item} />
        ))}
      </ul>
    </Card>
  );
}

export default async function InboxPage() {
  const user = await requireRole(["agency"], "/dashboard/inbox");
  const [agency, includePremium] = await Promise.all([getAgency(user.id), hasFeature(user, "premium_opportunities")]);
  const items = await getAgencyInbox(user.id, { includePremium });

  const forAgencies = items.filter((i) => i.section === "agency" && i.opportunity.status === "open");
  const matching = items.filter((i) => i.section === "services" && i.opportunity.status === "open");
  const proposed = items.filter((i) => i.proposal);
  const newCount = [...forAgencies, ...matching].filter((i) => !i.proposal).length;
  const mappedServices = (agency?.services ?? []).filter((s) => serviceCategory(s));

  return (
    <div>
      <PageHeader
        title="Opportunity inbox"
        description={
          newCount
            ? `${newCount} open ${newCount === 1 ? "opportunity" : "opportunities"} you haven't proposed to yet.`
            : "Agency partnerships and campaigns that match your services."
        }
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/profile">Edit services</Link>
            </Button>
            <Button asChild>
              <Link href="/marketplace">Browse marketplace</Link>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="agency">
        <TabsList className="mb-4 max-w-full overflow-x-auto">
          <TabsTrigger value="agency">
            <Building2 /> For agencies <span className="tabular-nums text-muted">{forAgencies.length}</span>
          </TabsTrigger>
          <TabsTrigger value="services">
            <Target /> Matching your services <span className="tabular-nums text-muted">{matching.length}</span>
          </TabsTrigger>
          <TabsTrigger value="proposed">
            <Send /> Already proposed <span className="tabular-nums text-muted">{proposed.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agency">
          <ItemList
            items={forAgencies}
            empty={
              <EmptyState
                icon={Inbox}
                title="No open agency partnerships right now"
                description="Businesses looking for an agency partner will appear here first. Check the matching tab for campaigns you can staff from your roster."
                action={
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/marketplace/agencies">See agency listings</Link>
                  </Button>
                }
              />
            }
          />
        </TabsContent>

        <TabsContent value="services">
          {mappedServices.length > 0 && (
            <p className="mb-3 text-[13px] text-subtle">
              Based on your services: <span className="font-medium text-ink">{mappedServices.join(", ")}</span>
            </p>
          )}
          <ItemList
            items={matching}
            empty={
              <EmptyState
                icon={Target}
                title={mappedServices.length ? "No matching opportunities right now" : "Add services to get matches"}
                description={
                  mappedServices.length
                    ? "New KOL, affiliate and sales opportunities that fit your services will show up here."
                    : "List services like KOL sourcing, affiliate program management or sales force outsourcing on your profile to see matching listings."
                }
                action={
                  <Button asChild variant="secondary" size="sm">
                    <Link href={mappedServices.length ? "/marketplace" : "/profile"}>
                      {mappedServices.length ? "Browse marketplace" : "Update profile"}
                    </Link>
                  </Button>
                }
              />
            }
          />
        </TabsContent>

        <TabsContent value="proposed">
          <ItemList
            items={proposed}
            empty={
              <EmptyState
                icon={Send}
                title="You haven't proposed to any opportunity yet"
                description="Open a listing and propose your agency or a talent from your roster."
                action={
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/dashboard/talents">Review your roster</Link>
                  </Button>
                }
              />
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
