import "server-only";
import { cache } from "react";
import { db } from "./store";
import { getCategoryNames, getSaved } from "./queries";
import { getCurrentUser } from "@/lib/auth/session";
import { hasFeature } from "@/lib/permissions";

// Marketplace-specific read helpers (browsing, opportunity detail, public profiles).

/** Everything the marketplace pages need to know about the current viewer. */
export const getViewerContext = cache(async () => {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, advanced: false, premium: false, saved: new Set<string>() };
  }
  const [advanced, premium, saved] = await Promise.all([
    hasFeature(user, "advanced_filters"),
    hasFeature(user, "premium_opportunities"),
    getSaved(user.id),
  ]);
  return {
    user,
    advanced,
    premium,
    saved: new Set(saved.map((s) => `${s.targetType}:${s.targetId}`)),
  };
});

export type ViewerContext = Awaited<ReturnType<typeof getViewerContext>>;

/** Admin-managed taxonomies used by the filter panels. */
export async function getTaxonomies() {
  const [industries, niches, locations] = await Promise.all([
    getCategoryNames("industry"),
    getCategoryNames("niche"),
    getCategoryNames("location"),
  ]);
  return { industries, niches, locations };
}

/** All of a user's applications to one opportunity (agencies may apply once per talent). */
export async function getApplicationsForOpportunityByApplicant(opportunityId: string, userId: string) {
  return db()
    .applications.filter((a) => a.opportunityId === opportunityId && a.applicantId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Whether the opportunity's owner account is suspended (listing should be hidden publicly). */
export async function isOwnerSuspended(businessId: string) {
  return db().users.find((u) => u.id === businessId)?.status === "suspended";
}
