import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { OpportunityForm } from "@/components/dashboard/opportunity-form";
import { Button } from "@/components/ui/button";
import { Card, EmptyState } from "@/components/ui/primitives";
import { requireRole } from "@/lib/auth/session";
import { getCategoryNames } from "@/lib/data/queries";
import { getUsage, hasFeature } from "@/lib/permissions";
import { Lock } from "lucide-react";
import { dateInputFromNow } from "@/lib/utils";

export const metadata: Metadata = { title: "New opportunity" };

export default async function NewOpportunityPage() {
  const user = await requireRole(["business"], "/dashboard/opportunities/new");
  const [industries, locations, canPremium, usage] = await Promise.all([
    getCategoryNames("industry"),
    getCategoryNames("location"),
    hasFeature(user, "priority_visibility"),
    getUsage(user),
  ]);
  const meter = usage.find((m) => m.key === "activeOpportunities");

  if (meter && meter.used >= meter.limit) {
    return (
      <>
        <PageHeader title="New opportunity" />
        <Card>
          <EmptyState
            icon={Lock}
            title="You've reached your active listing limit"
            description={`Your plan allows ${meter.limit} active opportunities. Pause or close one, or upgrade for more listings.`}
            action={
              <div className="flex gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard/opportunities">Manage listings</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/dashboard/billing">Upgrade plan</Link>
                </Button>
              </div>
            }
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="New opportunity" description="Describe the partnership. You can edit, pause or close it at any time." />
      <OpportunityForm
        industries={industries}
        locations={locations}
        canPremium={canPremium}
        defaults={{ deadline: dateInputFromNow(21) }}
      />
    </>
  );
}
