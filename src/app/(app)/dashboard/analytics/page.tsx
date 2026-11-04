import type { Metadata } from "next";
import { BarChart3, Bookmark, Eye, Handshake, ListChecks, Percent, Star, Target, TrendingUp, Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, EmptyState } from "@/components/ui/primitives";
import { FeatureGate, StatCard } from "@/components/dashboard/widgets";
import { BarsChart, DonutChart, TrendChart } from "@/components/dashboard/charts";
import { requireRole } from "@/lib/auth/session";
import { getBusinessInsights, getPartnerInsights } from "@/lib/data/insights";
import { getTalents } from "@/lib/data/queries";
import { hasFeature } from "@/lib/permissions";
import type { User } from "@/lib/types";
import { formatCompact, formatIDRShort } from "@/lib/utils";

export const metadata: Metadata = { title: "Analytics" };

const GATE = {
  title: "Advanced analytics is a Pro feature",
  description: "Upgrade to see trends, per-listing performance and partnership results over time.",
};

export default async function AnalyticsPage() {
  const user = await requireRole(["business", "sales", "creator", "agency"], "/dashboard/analytics");
  const allowed = await hasFeature(user, "analytics");
  const title = { business: "Analytics", sales: "Profile performance", creator: "Campaign performance", agency: "Agency analytics" }[user.role as Exclude<User["role"], "admin">];

  return (
    <>
      <PageHeader title={title} description="All figures are calculated from your activity on MarketIn and the results reported on each partnership." />
      {user.role === "business" ? <BusinessAnalytics user={user} allowed={allowed} /> : <PartnerAnalytics user={user} allowed={allowed} />}
    </>
  );
}

async function BusinessAnalytics({ user, allowed }: { user: User; allowed: boolean }) {
  const i = await getBusinessInsights(user.id);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Listing views" value={formatCompact(i.views)} icon={Eye} />
        <StatCard label="Applications" value={i.applications.length} hint={`${i.conversionRate.toFixed(1)}% of views`} icon={ListChecks} tone="brand" />
        <StatCard label="Partnerships" value={i.partnerships.length} hint={`${i.activePartnerships} active`} icon={Handshake} tone="success" />
        <StatCard label="Reported revenue" value={formatIDRShort(i.totals.revenue)} hint={`${i.totals.conversions} conversions · ${i.totals.leads} leads`} icon={TrendingUp} tone="blue" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <FeatureGate allowed={allowed} {...GATE}>
          <Card>
            <CardHeader title="Applications over time" description="Weekly, last 8 weeks" />
            <div className="p-4">
              <TrendChart data={i.weekly} dataKey="value" name="Applications" />
            </div>
          </Card>
        </FeatureGate>
        <FeatureGate allowed={allowed} {...GATE}>
          <Card>
            <CardHeader title="Performance by listing" description="Applications vs. views" />
            <div className="p-4">
              {i.perOpportunity.length ? (
                <BarsChart data={i.perOpportunity} bars={[{ key: "applications", name: "Applications" }, { key: "views", name: "Views", color: "#B3C6DE" }]} />
              ) : (
                <EmptyState icon={BarChart3} title="No listings yet" className="py-10" />
              )}
            </div>
          </Card>
        </FeatureGate>
        <FeatureGate allowed={allowed} {...GATE}>
          <Card>
            <CardHeader title="Revenue by partner" description="Reported on each partnership" />
            <div className="p-4">
              {i.byPartnership.length ? (
                <BarsChart data={i.byPartnership} bars={[{ key: "revenue", name: "Revenue", color: "#F47735" }]} currency />
              ) : (
                <EmptyState icon={TrendingUp} title="No revenue reported yet" className="py-10" />
              )}
            </div>
          </Card>
        </FeatureGate>
        <Card>
          <CardHeader title="Application pipeline" description="Current status of every application" />
          <div className="p-5">{i.breakdown.length ? <DonutChart data={i.breakdown} /> : <EmptyState title="No applications yet" className="py-10" />}</div>
        </Card>
      </div>
    </>
  );
}

async function PartnerAnalytics({ user, allowed }: { user: User; allowed: boolean }) {
  const i = await getPartnerInsights(user.id);
  const isCreator = user.role === "creator";
  const talents = user.role === "agency" ? await getTalents(user.id) : [];
  const talentBreakdown = (["creator", "affiliate", "sales"] as const)
    .map((t) => ({ name: { creator: "Creators", affiliate: "Affiliates", sales: "Sales reps" }[t], value: talents.filter((x) => x.type === t).length }))
    .filter((x) => x.value > 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Applications sent" value={i.applications.length} hint={`${i.activeApplications} in progress`} icon={ListChecks} />
        <StatCard label="Success rate" value={`${i.successRate.toFixed(0)}%`} hint="Accepted of decided applications" icon={Percent} tone="brand" />
        <StatCard label="Rating" value={i.reviewCount ? i.rating.toFixed(1) : "—"} hint={`${i.reviewCount} review${i.reviewCount === 1 ? "" : "s"}`} icon={Star} tone="success" />
        <StatCard label="Saved by businesses" value={i.savedBy} hint="Times your profile was saved" icon={Bookmark} tone="blue" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Reported revenue" value={formatIDRShort(i.totals.revenue)} icon={TrendingUp} />
        <StatCard label={isCreator ? "Reported reach" : "Leads generated"} value={isCreator ? formatCompact(i.totals.reach) : i.totals.leads} icon={isCreator ? Users : Target} />
        <StatCard label={isCreator ? "Content delivered" : "Conversions"} value={isCreator ? i.totals.content : i.totals.conversions} icon={Handshake} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <FeatureGate allowed={allowed} {...GATE}>
          <Card>
            <CardHeader title={user.role === "agency" ? "Proposals over time" : "Applications over time"} description="Weekly, last 8 weeks" />
            <div className="p-4">
              <TrendChart data={i.weekly} dataKey="value" name="Applications" />
            </div>
          </Card>
        </FeatureGate>
        <Card>
          <CardHeader title="Application outcomes" />
          <div className="p-5">{i.breakdown.length ? <DonutChart data={i.breakdown} /> : <EmptyState title="No applications yet" className="py-10" />}</div>
        </Card>
        <FeatureGate allowed={allowed} {...GATE}>
          <Card>
            <CardHeader title="Results by partnership" description={isCreator ? "Reported reach" : "Reported revenue"} />
            <div className="p-4">
              {i.byPartnership.some((p) => (isCreator ? p.reach : p.revenue) > 0) ? (
                isCreator ? (
                  <BarsChart data={i.byPartnership} bars={[{ key: "reach", name: "Reach", color: "#F47735" }]} />
                ) : (
                  <BarsChart data={i.byPartnership} bars={[{ key: "revenue", name: "Revenue", color: "#F47735" }]} currency />
                )
              ) : (
                <EmptyState icon={TrendingUp} title="No results reported yet" className="py-10" />
              )}
            </div>
          </Card>
        </FeatureGate>
        {user.role === "agency" && (
          <Card>
            <CardHeader title="Roster composition" />
            <div className="p-5">{talentBreakdown.length ? <DonutChart data={talentBreakdown} /> : <EmptyState title="No talents yet" className="py-10" />}</div>
          </Card>
        )}
      </div>
    </>
  );
}
