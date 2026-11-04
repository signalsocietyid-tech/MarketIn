import "server-only";
import type { Application, Opportunity, User } from "@/lib/types";
import { APPLICATION_STATUSES, APPLICATION_STATUS_LABEL, OPPORTUNITY_TYPE_LABEL } from "@/lib/constants";
import { data } from "@/lib/db";
import { toOpportunityView } from "./queries";

// Aggregations for dashboards. Everything here is derived from stored records —
// no figures are invented. Partnership metrics are values reported on the partnership.

const WEEK = 7 * 86_400_000;

export function weeklyCounts(dates: string[], weeks = 8) {
  const now = Date.now();
  return Array.from({ length: weeks }, (_, i) => {
    const end = now - (weeks - 1 - i) * WEEK;
    const start = end - WEEK;
    const label = new Date(end).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    return { label, value: dates.filter((d) => {
      const t = new Date(d).getTime();
      return t > start && t <= end;
    }).length };
  });
}

export function statusBreakdown(apps: Application[]) {
  return APPLICATION_STATUSES.map((s) => ({ name: APPLICATION_STATUS_LABEL[s], value: apps.filter((a) => a.status === s).length })).filter((d) => d.value > 0);
}

export async function getBusinessInsights(businessId: string) {
  const d = await data();
  const opps = d.opportunities.filter((o) => o.businessId === businessId);
  const oppIds = new Set(opps.map((o) => o.id));
  const apps = d.applications.filter((a) => oppIds.has(a.opportunityId));
  const partnerships = d.partnerships.filter((p) => p.businessId === businessId);
  const totals = partnerships.reduce(
    (acc, p) => ({
      leads: acc.leads + p.metrics.leads,
      conversions: acc.conversions + p.metrics.conversions,
      revenue: acc.revenue + p.metrics.revenue,
      reach: acc.reach + p.metrics.reach,
      content: acc.content + p.metrics.contentPieces,
    }),
    { leads: 0, conversions: 0, revenue: 0, reach: 0, content: 0 },
  );
  const views = opps.reduce((s, o) => s + o.views, 0);
  const perOpportunity = opps
    .map((o) => ({
      label: o.title.length > 22 ? `${o.title.slice(0, 20)}…` : o.title,
      applications: apps.filter((a) => a.opportunityId === o.id).length,
      views: o.views,
    }))
    .sort((a, b) => b.applications - a.applications)
    .slice(0, 6);
  return {
    opportunities: opps,
    openCount: opps.filter((o) => o.status === "open").length,
    applications: apps,
    pendingReview: apps.filter((a) => a.status === "pending" || a.status === "under_review").length,
    partnerships,
    activePartnerships: partnerships.filter((p) => p.status === "active").length,
    totals,
    views,
    conversionRate: views ? (apps.length / views) * 100 : 0,
    weekly: weeklyCounts(apps.map((a) => a.createdAt)),
    breakdown: statusBreakdown(apps),
    perOpportunity,
    byPartnership: partnerships
      .filter((p) => p.metrics.revenue > 0)
      .map((p) => ({ label: d.users.find((u) => u.id === p.partnerId)?.name.split(" ")[0] ?? "Partner", revenue: p.metrics.revenue })),
  };
}

export async function getPartnerInsights(userId: string) {
  const d = await data();
  const apps = d.applications.filter((a) => a.applicantId === userId);
  const partnerships = d.partnerships.filter((p) => p.partnerId === userId);
  const decided = apps.filter((a) => ["accepted", "rejected", "completed"].includes(a.status));
  const won = apps.filter((a) => a.status === "accepted" || a.status === "completed");
  const totals = partnerships.reduce(
    (acc, p) => ({
      leads: acc.leads + p.metrics.leads,
      conversions: acc.conversions + p.metrics.conversions,
      revenue: acc.revenue + p.metrics.revenue,
      reach: acc.reach + p.metrics.reach,
      content: acc.content + p.metrics.contentPieces,
    }),
    { leads: 0, conversions: 0, revenue: 0, reach: 0, content: 0 },
  );
  const reviews = d.reviews.filter((r) => r.revieweeId === userId);
  const savedBy = d.saved.filter((s) => s.targetType === "profile" && s.targetId === userId).length;
  return {
    applications: apps,
    activeApplications: apps.filter((a) => ["pending", "under_review", "shortlisted"].includes(a.status)).length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    partnerships,
    activePartnerships: partnerships.filter((p) => p.status === "active").length,
    successRate: decided.length ? (won.length / decided.length) * 100 : 0,
    totals,
    rating: reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0,
    reviewCount: reviews.length,
    savedBy,
    weekly: weeklyCounts(apps.map((a) => a.createdAt)),
    breakdown: statusBreakdown(apps),
    byPartnership: partnerships.map((p) => {
      const o = d.opportunities.find((x) => x.id === p.opportunityId);
      return {
        label: (o?.companyName ?? "Partner").split(" ")[0],
        revenue: p.metrics.revenue,
        conversions: p.metrics.conversions,
        reach: p.metrics.reach,
        content: p.metrics.contentPieces,
      };
    }),
  };
}

/** Rank open opportunities for a partner account by profile fit. */
export async function getRecommendations(user: User, limit = 12, includePremium = false) {
  const d = await data();
  const applied = new Set(d.applications.filter((a) => a.applicantId === user.id).map((a) => a.opportunityId));
  const sales = d.salesPartners.find((s) => s.userId === user.id);
  const creator = d.creators.find((c) => c.userId === user.id);
  const agency = d.agencies.find((a) => a.userId === user.id);

  const score = (o: Opportunity) => {
    const reasons: string[] = [];
    let s = 0;
    const hit = (points: number, reason?: string) => {
      s += points;
      if (reason) reasons.push(reason);
    };
    if (sales) {
      if (o.category === "sales") hit(3, "Sales & distribution");
      if (o.category === "affiliate" && o.type === "reseller_partnership") hit(1, "Reseller opportunity");
      if (sales.industries.includes(o.industry)) hit(3, o.industry);
      if (sales.areas.includes(o.location) || sales.location === o.location) hit(2, `Covers ${o.location}`);
      const exp = sales.experienceYears;
      const level = exp >= 6 ? "senior" : exp >= 3 ? "mid" : "junior";
      if (o.experienceLevel === "any" || o.experienceLevel === level) hit(1);
    }
    if (creator) {
      if (o.category === "kol" || o.category === "affiliate") hit(2);
      const platforms = creator.socials.map((x) => x.platform);
      const shared = (o.platforms ?? []).filter((p) => platforms.includes(p));
      if (shared.length) hit(3, `Uses ${shared.map((p) => p[0].toUpperCase() + p.slice(1)).join(", ")}`);
      const nicheHit = creator.niches.find((n) => o.description.toLowerCase().includes(n.split(" ")[0].toLowerCase()) || o.industry.toLowerCase().includes(n.split(" ")[0].toLowerCase()));
      if (nicheHit) hit(2, nicheHit);
      if (creator.creatorTypes.includes("Affiliate Marketer") && o.category === "affiliate") hit(2, "Affiliate program");
      if (creator.creatorTypes.includes("UGC Creator") && o.type === "ugc_collaboration") hit(2, "UGC");
      if (o.remote) hit(1);
    }
    if (agency) {
      if (o.category === "agency") hit(4, "Agency partnership");
      if (o.category === "kol" && agency.services.some((x) => /kol|content|campaign/i.test(x))) hit(2, "Matches your services");
      if (o.category === "sales" && agency.services.some((x) => /sales|distributor/i.test(x))) hit(2, "Matches your services");
    }
    return { s, reasons: Array.from(new Set(reasons)).slice(0, 3) };
  };

  return d.opportunities
    .filter((o) => o.status === "open" && !o.flagged && !applied.has(o.id) && o.businessId !== user.id)
    .map((o) => ({ o, ...score(o) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.o.createdAt.localeCompare(a.o.createdAt))
    .slice(0, limit)
    .map((x) => ({ opportunity: { ...toOpportunityView(d, x.o), locked: x.o.premium && !includePremium }, reasons: x.reasons, typeLabel: OPPORTUNITY_TYPE_LABEL[x.o.type] }));
}
