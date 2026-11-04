import "server-only";
import type { FeatureKey, PlanLimits, Role, User } from "@/lib/types";
import { data } from "@/lib/db";
import { countApplicationsThisMonth, getEffectivePlan } from "@/lib/data/queries";

/**
 * Feature access is driven entirely by plan data (entitlements + limits), which
 * admins edit in /admin/plans. Nothing here hardcodes which plan unlocks what.
 */

/** Which roles may perform which marketplace actions, independent of plan. */
const ROLE_CAPABILITIES = {
  publishOpportunity: ["business"],
  reviewApplications: ["business"],
  applyToOpportunity: ["sales", "creator", "agency"],
  manageTalents: ["agency"],
  manageTeam: ["agency"],
  savePartners: ["business", "agency"],
  admin: ["admin"],
} satisfies Record<string, Role[]>;

export type Capability = keyof typeof ROLE_CAPABILITIES;

export function roleCan(role: Role, capability: Capability) {
  return (ROLE_CAPABILITIES[capability] as Role[]).includes(role);
}

export async function hasFeature(user: Pick<User, "id" | "role">, feature: FeatureKey) {
  if (user.role === "admin") return true;
  const plan = await getEffectivePlan(user);
  return !!plan?.entitlements.includes(feature);
}

export async function getLimit(user: Pick<User, "id" | "role">, key: keyof PlanLimits) {
  const plan = await getEffectivePlan(user);
  return plan?.limits[key] ?? 0;
}

export type UsageMeter = { key: keyof PlanLimits; label: string; used: number; limit: number };

/** Current usage against the plan limits that matter for this role. */
export async function getUsage(user: Pick<User, "id" | "role">): Promise<UsageMeter[]> {
  const plan = await getEffectivePlan(user);
  if (!plan) return [];
  const d = await data();
  const savedUsed = d.saved.filter((s) => s.userId === user.id).length;
  const meters: UsageMeter[] = [];
  if (user.role === "business") {
    meters.push({
      key: "activeOpportunities",
      label: "Active opportunities",
      used: d.opportunities.filter((o) => o.businessId === user.id && o.status === "open").length,
      limit: plan.limits.activeOpportunities,
    });
  } else {
    meters.push({
      key: "monthlyApplications",
      label: "Applications this month",
      used: await countApplicationsThisMonth(user.id),
      limit: plan.limits.monthlyApplications,
    });
  }
  if (user.role === "agency") {
    meters.push({ key: "talentRoster", label: "Talent roster", used: d.talents.filter((t) => t.agencyId === user.id).length, limit: plan.limits.talentRoster });
    meters.push({ key: "teamMembers", label: "Team members", used: d.teamMembers.filter((t) => t.agencyId === user.id).length, limit: plan.limits.teamMembers });
  }
  meters.push({ key: "savedItems", label: "Saved items", used: savedUsed, limit: plan.limits.savedItems });
  return meters;
}

export async function withinLimit(user: Pick<User, "id" | "role">, key: keyof PlanLimits) {
  const meter = (await getUsage(user)).find((m) => m.key === key);
  return !meter || meter.used < meter.limit;
}


export { FEATURE_LABEL } from "@/lib/constants";
