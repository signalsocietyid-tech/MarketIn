import "server-only";
import type {
  AgencyProfile,
  Application,
  BusinessProfile,
  CreatorProfile,
  Opportunity,
  Role,
  SalesProfile,
  Segment,
  SocialPlatform,
  SubscriptionPlan,
  User,
  UserSubscription,
} from "@/lib/types";
import { AUDIENCE_SIZES, BUDGET_RANGES, OPPORTUNITY_TYPE_LABEL, SEGMENT_LABEL } from "@/lib/constants";
import { db } from "./store";

// Read-side data access. Every function is async so the mock store can be
// swapped for the Supabase adapter (see src/lib/supabase) without touching pages.

/* --------------------------------- Users ---------------------------------- */

export async function getUser(id: string) {
  return db().users.find((u) => u.id === id) ?? null;
}

export async function getUserByEmail(email: string) {
  const e = email.trim().toLowerCase();
  return db().users.find((u) => u.email.toLowerCase() === e) ?? null;
}

export async function getBusiness(userId: string) {
  return db().businesses.find((b) => b.userId === userId) ?? null;
}
export async function getSalesPartner(userId: string) {
  return db().salesPartners.find((b) => b.userId === userId) ?? null;
}
export async function getCreator(userId: string) {
  return db().creators.find((b) => b.userId === userId) ?? null;
}
export async function getAgency(userId: string) {
  return db().agencies.find((b) => b.userId === userId) ?? null;
}

/* ------------------------------ Subscriptions ------------------------------ */

export async function getPlans(segment?: Segment, includeInactive = false) {
  return db()
    .plans.filter((p) => (!segment || p.segment === segment) && (includeInactive || p.active))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPlan(id: string) {
  return db().plans.find((p) => p.id === id) ?? null;
}

function isLive(s: UserSubscription) {
  return s.status === "active" && new Date(s.currentPeriodEnd).getTime() > Date.now();
}

export async function getActiveSubscription(userId: string) {
  return db().subscriptions.find((s) => s.userId === userId && isLive(s)) ?? null;
}

export async function getPendingSubscription(userId: string) {
  return db().subscriptions.find((s) => s.userId === userId && s.status === "pending_payment") ?? null;
}

export async function getSubscriptionHistory(userId: string) {
  return db()
    .subscriptionEvents.filter((e) => e.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** The plan whose entitlements currently apply: an active paid plan, else the segment's free plan. */
export async function getEffectivePlan(user: Pick<User, "id" | "role">): Promise<SubscriptionPlan | null> {
  if (user.role === "admin") return null;
  const sub = await getActiveSubscription(user.id);
  const plan = sub ? db().plans.find((p) => p.id === sub.planId) : undefined;
  if (plan) return plan;
  return db().plans.find((p) => p.segment === user.role && p.tier === "free") ?? null;
}

function isProUser(userId: string) {
  const sub = db().subscriptions.find((s) => s.userId === userId && isLive(s));
  if (!sub) return false;
  return db().plans.find((p) => p.id === sub.planId)?.tier === "pro";
}

function hasPriority(userId: string) {
  const sub = db().subscriptions.find((s) => s.userId === userId && isLive(s));
  const plan = sub && db().plans.find((p) => p.id === sub.planId);
  return !!plan?.entitlements.some((e) => e === "priority_visibility" || e === "priority_access");
}

/* --------------------------------- Ratings --------------------------------- */

export function ratingFor(userId: string) {
  const rs = db().reviews.filter((r) => r.revieweeId === userId);
  if (!rs.length) return { average: 0, count: 0 };
  return { average: rs.reduce((s, r) => s + r.rating, 0) / rs.length, count: rs.length };
}

export async function getReviewsFor(userId: string) {
  return db()
    .reviews.filter((r) => r.revieweeId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => ({ ...r, reviewer: db().users.find((u) => u.id === r.reviewerId) }));
}

/* ------------------------------ Profile views ------------------------------ */

export type ProfileView = {
  id: string;
  role: Segment;
  roleLabel: string;
  name: string;
  headline: string;
  location: string;
  verified: boolean;
  pro: boolean;
  avatarUrl?: string;
  tags: string[];
  about: string;
  website?: string;
  rating: { average: number; count: number };
  stats: { label: string; value: string }[];
  joinedAt: string;
  status: User["status"];
  business?: BusinessProfile;
  sales?: SalesProfile;
  creator?: CreatorProfile;
  agency?: AgencyProfile;
};

function compact(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export function buildProfileView(user: User): ProfileView | null {
  if (user.role === "admin") return null;
  const d = db();
  const base = {
    id: user.id,
    role: user.role,
    roleLabel: SEGMENT_LABEL[user.role],
    verified: user.verification === "verified",
    pro: isProUser(user.id),
    rating: ratingFor(user.id),
    joinedAt: user.createdAt,
    status: user.status,
  };
  const completed = d.partnerships.filter((p) => p.partnerId === user.id || p.businessId === user.id).length;

  if (user.role === "business") {
    const b = d.businesses.find((x) => x.userId === user.id);
    if (!b) return null;
    const open = d.opportunities.filter((o) => o.businessId === user.id && o.status === "open").length;
    return {
      ...base,
      name: b.companyName,
      headline: `${b.category} · ${b.industry}`,
      location: b.location,
      avatarUrl: b.logoUrl,
      tags: [b.industry, b.category],
      about: b.description,
      website: b.website,
      stats: [
        { label: "Open opportunities", value: String(open) },
        { label: "Partnerships", value: String(completed) },
        { label: "Company size", value: b.companySize ?? "—" },
      ],
      business: b,
    };
  }
  if (user.role === "sales") {
    const s = d.salesPartners.find((x) => x.userId === user.id);
    if (!s) return null;
    return {
      ...base,
      name: s.fullName,
      headline: s.title,
      location: s.location,
      tags: [...s.industries, ...s.specializations].slice(0, 5),
      about: s.bio,
      stats: [
        { label: "Experience", value: `${s.experienceYears} yrs` },
        { label: "Coverage", value: `${s.areas.length} ${s.areas.length === 1 ? "city" : "cities"}` },
        { label: "Partnerships", value: String(completed) },
      ],
      sales: s,
    };
  }
  if (user.role === "creator") {
    const c = d.creators.find((x) => x.userId === user.id);
    if (!c) return null;
    const followers = c.socials.reduce((sum, s) => sum + s.followers, 0);
    return {
      ...base,
      name: c.fullName,
      headline: c.creatorTypes.join(" · "),
      location: c.location,
      tags: c.niches,
      about: c.bio,
      stats: [
        { label: "Total audience", value: compact(followers) },
        { label: "Engagement", value: c.engagementRate ? `${c.engagementRate}%` : "—" },
        { label: "Collaborations", value: String(completed) },
      ],
      creator: c,
    };
  }
  const a = d.agencies.find((x) => x.userId === user.id);
  if (!a) return null;
  const talents = d.talents.filter((t) => t.agencyId === user.id).length;
  return {
    ...base,
    name: a.agencyName,
    headline: a.category,
    location: a.location,
    tags: a.services.slice(0, 4),
    about: a.description,
    website: a.website,
    stats: [
      { label: "Talents", value: String(talents) },
      { label: "Team size", value: a.teamSize },
      { label: "Partnerships", value: String(completed) },
    ],
    agency: a,
  };
}

export async function getProfileView(userId: string) {
  const u = await getUser(userId);
  return u ? buildProfileView(u) : null;
}

/* ------------------------------ Partner search ----------------------------- */

export type PartnerFilters = {
  q?: string;
  industry?: string;
  location?: string;
  experience?: string;
  specialization?: string;
  partnershipType?: string;
  platform?: string;
  niche?: string;
  audience?: string;
  engagement?: string;
  creatorType?: string;
  agencyCategory?: string;
  service?: string;
  verified?: string;
  sort?: string;
};

export async function searchPartners(kind: Exclude<Segment, "business"> | "business", f: PartnerFilters) {
  const d = db();
  const q = f.q?.toLowerCase().trim();
  const users = d.users.filter((u) => u.role === kind && u.status !== "suspended");

  const views = users
    .filter((u) => {
      if (f.verified === "1" && u.verification !== "verified") return false;
      if (kind === "sales") {
        const s = d.salesPartners.find((x) => x.userId === u.id);
        if (!s) return false;
        if (f.industry && !s.industries.includes(f.industry)) return false;
        if (f.location && s.location !== f.location && !s.areas.includes(f.location)) return false;
        if (f.specialization && !s.specializations.includes(f.specialization)) return false;
        if (f.partnershipType && !s.partnershipTypes.includes(f.partnershipType)) return false;
        if (f.experience === "junior" && s.experienceYears > 2) return false;
        if (f.experience === "mid" && (s.experienceYears < 3 || s.experienceYears > 5)) return false;
        if (f.experience === "senior" && s.experienceYears < 6) return false;
        if (q && ![s.fullName, s.title, s.bio, ...s.industries, ...s.areas].join(" ").toLowerCase().includes(q)) return false;
      } else if (kind === "creator") {
        const c = d.creators.find((x) => x.userId === u.id);
        if (!c) return false;
        if (f.platform && !c.socials.some((s) => s.platform === f.platform)) return false;
        if (f.niche && !c.niches.includes(f.niche)) return false;
        if (f.location && c.location !== f.location) return false;
        if (f.creatorType && !c.creatorTypes.includes(f.creatorType)) return false;
        if (f.engagement && (c.engagementRate ?? 0) < Number(f.engagement)) return false;
        if (f.audience) {
          const range = AUDIENCE_SIZES.find((a) => a.value === f.audience);
          const total = c.socials.reduce((s, x) => s + x.followers, 0);
          if (range && (total < range.min || total >= range.max)) return false;
        }
        if (q && ![c.fullName, c.bio, ...c.niches, ...c.socials.map((s) => s.handle)].join(" ").toLowerCase().includes(q)) return false;
      } else if (kind === "agency") {
        const a = d.agencies.find((x) => x.userId === u.id);
        if (!a) return false;
        if (f.agencyCategory && a.category !== f.agencyCategory) return false;
        if (f.service && !a.services.includes(f.service)) return false;
        if (f.location && a.location !== f.location) return false;
        if (q && ![a.agencyName, a.description, ...a.services].join(" ").toLowerCase().includes(q)) return false;
      } else {
        const b = d.businesses.find((x) => x.userId === u.id);
        if (!b) return false;
        if (f.industry && b.industry !== f.industry) return false;
        if (f.location && b.location !== f.location) return false;
        if (q && ![b.companyName, b.description, b.industry].join(" ").toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .map((u) => ({ view: buildProfileView(u), priority: hasPriority(u.id) }))
    .filter((x): x is { view: ProfileView; priority: boolean } => !!x.view);

  views.sort((a, b) => {
    if (f.sort === "rating") return b.view.rating.average - a.view.rating.average;
    if (f.sort === "newest") return b.view.joinedAt.localeCompare(a.view.joinedAt);
    // Default "recommended": priority visibility (Pro entitlement), then verified, then rating.
    return (
      Number(b.priority) - Number(a.priority) ||
      Number(b.view.verified) - Number(a.view.verified) ||
      b.view.rating.average - a.view.rating.average
    );
  });
  return views.map((v) => v.view);
}

/* ------------------------------ Opportunities ------------------------------ */

export type OpportunityFilters = {
  q?: string;
  category?: string;
  type?: string;
  industry?: string;
  location?: string;
  compensation?: string;
  budget?: string;
  experience?: string;
  platform?: string;
  verified?: string;
  remote?: string;
  sort?: string;
};

export type OpportunityView = Opportunity & {
  typeLabel: string;
  businessVerified: boolean;
  businessLogo?: string;
  applicants: number;
};

export function toOpportunityView(o: Opportunity): OpportunityView {
  const d = db();
  const biz = d.users.find((u) => u.id === o.businessId);
  return {
    ...o,
    typeLabel: OPPORTUNITY_TYPE_LABEL[o.type],
    businessVerified: biz?.verification === "verified",
    businessLogo: d.businesses.find((b) => b.userId === o.businessId)?.logoUrl,
    applicants: d.applications.filter((a) => a.opportunityId === o.id).length,
  };
}

export async function searchOpportunities(f: OpportunityFilters, opts: { includePremium?: boolean } = {}) {
  const d = db();
  const q = f.q?.toLowerCase().trim();
  const list = d.opportunities.filter((o) => {
    if (o.status !== "open" || o.flagged) return false;
    const owner = d.users.find((u) => u.id === o.businessId);
    if (!owner || owner.status === "suspended") return false;
    if (f.category && o.category !== f.category) return false;
    if (f.type && o.type !== f.type) return false;
    if (f.industry && o.industry !== f.industry) return false;
    if (f.location && o.location !== f.location) return false;
    if (f.compensation && o.compensationModel !== f.compensation) return false;
    if (f.experience && f.experience !== "any" && o.experienceLevel !== f.experience && o.experienceLevel !== "any") return false;
    if (f.platform && !o.platforms?.includes(f.platform as SocialPlatform)) return false;
    if (f.remote === "1" && !o.remote) return false;
    if (f.verified === "1" && owner.verification !== "verified") return false;
    if (f.budget) {
      const r = BUDGET_RANGES.find((b) => b.value === f.budget);
      if (r && (o.budgetMax === undefined || o.budgetMax < r.min || (o.budgetMin ?? 0) >= r.max)) return false;
    }
    if (q && ![o.title, o.companyName, o.description, o.industry, o.location].join(" ").toLowerCase().includes(q)) return false;
    return true;
  });

  list.sort((a, b) => {
    if (f.sort === "deadline") return a.deadline.localeCompare(b.deadline);
    if (f.sort === "budget") return (b.budgetMax ?? 0) - (a.budgetMax ?? 0);
    if (f.sort === "newest") return b.createdAt.localeCompare(a.createdAt);
    // Recommended: featured, then businesses with priority visibility, then newest.
    return (
      Number(b.featured) - Number(a.featured) ||
      Number(hasPriority(b.businessId)) - Number(hasPriority(a.businessId)) ||
      b.createdAt.localeCompare(a.createdAt)
    );
  });

  return list.map(toOpportunityView).map((o) => ({ ...o, locked: o.premium && !opts.includePremium }));
}

export async function getOpportunity(id: string) {
  const o = db().opportunities.find((x) => x.id === id);
  return o ? toOpportunityView(o) : null;
}

export async function getOpportunitiesByBusiness(businessId: string) {
  return db()
    .opportunities.filter((o) => o.businessId === businessId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toOpportunityView);
}

export async function countOpportunitiesByCategory() {
  const counts: Record<string, number> = {};
  const suspended = new Set(db().users.filter((u) => u.status === "suspended").map((u) => u.id));
  for (const o of db().opportunities)
    if (o.status === "open" && !o.flagged && !suspended.has(o.businessId)) counts[o.category] = (counts[o.category] ?? 0) + 1;
  return counts;
}

/* ------------------------------- Applications ------------------------------ */

export type ApplicationView = Application & {
  opportunity: Opportunity;
  applicant: ProfileView | null;
  talentName?: string;
};

function toApplicationView(a: Application): ApplicationView | null {
  const d = db();
  const opportunity = d.opportunities.find((o) => o.id === a.opportunityId);
  const user = d.users.find((u) => u.id === a.applicantId);
  if (!opportunity || !user) return null;
  return {
    ...a,
    opportunity,
    applicant: buildProfileView(user),
    talentName: a.talentId ? d.talents.find((t) => t.id === a.talentId)?.name : undefined,
  };
}

const viewsOf = (list: Application[]) =>
  list
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(toApplicationView)
    .filter((x): x is ApplicationView => !!x);

export async function getApplicationsByApplicant(userId: string) {
  return viewsOf(db().applications.filter((a) => a.applicantId === userId));
}

export async function getApplicationsForOpportunity(opportunityId: string) {
  return viewsOf(db().applications.filter((a) => a.opportunityId === opportunityId));
}

export async function getApplicationsForBusiness(businessId: string) {
  const ids = new Set(db().opportunities.filter((o) => o.businessId === businessId).map((o) => o.id));
  return viewsOf(db().applications.filter((a) => ids.has(a.opportunityId)));
}

export async function getExistingApplication(opportunityId: string, userId: string) {
  return db().applications.find((a) => a.opportunityId === opportunityId && a.applicantId === userId) ?? null;
}

export async function countApplicationsThisMonth(userId: string) {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return db().applications.filter((a) => a.applicantId === userId && new Date(a.createdAt) >= start).length;
}

/* ------------------------------- Partnerships ------------------------------ */

export async function getPartnershipsForUser(userId: string) {
  const d = db();
  return d.partnerships
    .filter((p) => p.businessId === userId || p.partnerId === userId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .map((p) => {
      const counterpartId = p.businessId === userId ? p.partnerId : p.businessId;
      const counterpart = d.users.find((u) => u.id === counterpartId);
      return {
        ...p,
        opportunity: d.opportunities.find((o) => o.id === p.opportunityId)!,
        counterpart: counterpart ? buildProfileView(counterpart) : null,
        reviewed: d.reviews.some((r) => r.partnershipId === p.id && r.reviewerId === userId),
      };
    });
}

/* -------------------------- Saved, notifications --------------------------- */

export async function getSaved(userId: string) {
  return db().saved.filter((s) => s.userId === userId);
}

export async function isSaved(userId: string | undefined, targetType: "opportunity" | "profile", targetId: string) {
  if (!userId) return false;
  return db().saved.some((s) => s.userId === userId && s.targetType === targetType && s.targetId === targetId);
}

export async function getNotifications(userId: string) {
  return db()
    .notifications.filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* ------------------------------ Agency helpers ----------------------------- */

export async function getTalents(agencyId: string) {
  return db()
    .talents.filter((t) => t.agencyId === agencyId)
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export async function getTeamMembers(agencyId: string) {
  return db().teamMembers.filter((t) => t.agencyId === agencyId);
}

/* -------------------------------- Taxonomy --------------------------------- */

export async function getCategoryNames(kind: "industry" | "niche" | "location") {
  return db()
    .categories.filter((c) => c.kind === kind && c.active)
    .map((c) => c.name);
}

/* ---------------------------------- Admin ---------------------------------- */

export async function getMarketplaceStats() {
  const d = db();
  const byRole = (r: Role) => d.users.filter((u) => u.role === r).length;
  const mrr = d.subscriptions
    .filter(isLive)
    .reduce((sum, s) => {
      const p = d.plans.find((x) => x.id === s.planId);
      if (!p) return sum;
      return sum + (s.billingCycle === "yearly" ? p.priceYearly / 12 : p.priceMonthly);
    }, 0);
  return {
    users: d.users.filter((u) => u.role !== "admin").length,
    byRole: { business: byRole("business"), sales: byRole("sales"), creator: byRole("creator"), agency: byRole("agency") },
    openOpportunities: d.opportunities.filter((o) => o.status === "open").length,
    totalOpportunities: d.opportunities.length,
    applications: d.applications.length,
    partnerships: d.partnerships.length,
    activeSubscriptions: d.subscriptions.filter(isLive).length,
    pendingSubscriptions: d.subscriptions.filter((s) => s.status === "pending_payment").length,
    pendingVerifications: d.users.filter((u) => u.role !== "admin" && u.verification === "pending").length,
    openReports: d.reports.filter((r) => r.status === "open").length,
    flaggedAccounts: d.users.filter((u) => u.status === "flagged").length,
    mrr,
  };
}
