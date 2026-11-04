import "server-only";
import type {
  AccountStatus,
  ApplicationStatus,
  CategoryKind,
  MarketCategory,
  OpportunityStatus,
  Report,
  Segment,
  SubscriptionPlan,
  SubscriptionStatus,
  User,
  UserSubscription,
  VerificationStatus,
} from "@/lib/types";
import { APPLICATION_STATUSES, OPPORTUNITY_TYPE_LABEL, SEGMENTS } from "@/lib/constants";
import { db } from "./store";
import { buildProfileView } from "./queries";

// Read-side helpers for the admin console. All functions are async so they can
// be swapped for a Supabase adapter later without touching the pages.

const lc = (s: string | undefined) => (s ?? "").toLowerCase().trim();

function isLive(s: UserSubscription) {
  return s.status === "active" && new Date(s.currentPeriodEnd).getTime() > Date.now();
}

/** Display name + avatar for any user (company/agency name for organisations). */
function identity(user: User | undefined) {
  if (!user) return { id: "", name: "Deleted user", email: "", role: "admin" as const, avatarUrl: undefined as string | undefined };
  const view = buildProfileView(user);
  return { id: user.id, name: view?.name ?? user.name, email: user.email, role: user.role, avatarUrl: view?.avatarUrl };
}

export async function getAdminUnreadCount(userId: string) {
  return db().notifications.filter((n) => n.userId === userId && !n.read).length;
}

/* ---------------------------------- Users ---------------------------------- */

export type AdminUserRow = {
  id: string;
  name: string;
  contactName: string;
  email: string;
  role: Segment;
  status: AccountStatus;
  verification: VerificationStatus;
  avatarUrl?: string;
  planName: string;
  planTier: "free" | "pro";
  pendingPayment: boolean;
  createdAt: string;
  lastActiveAt: string;
};

export type AdminUserFilters = { q?: string; role?: string; status?: string; verification?: string };

function planFor(userId: string, role: Segment): SubscriptionPlan | undefined {
  const d = db();
  const sub = d.subscriptions.find((s) => s.userId === userId && isLive(s));
  const plan = sub ? d.plans.find((p) => p.id === sub.planId) : undefined;
  return plan ?? d.plans.find((p) => p.segment === role && p.tier === "free");
}

export async function getAdminUsers(f: AdminUserFilters = {}) {
  const d = db();
  const q = lc(f.q);
  const rows: AdminUserRow[] = [];
  for (const u of d.users) {
    if (u.role === "admin") continue;
    const role = u.role as Segment;
    const view = buildProfileView(u);
    const plan = planFor(u.id, role);
    const row: AdminUserRow = {
      id: u.id,
      name: view?.name ?? u.name,
      contactName: u.name,
      email: u.email,
      role,
      status: u.status,
      verification: u.verification,
      avatarUrl: view?.avatarUrl,
      planName: plan?.name ?? "Free",
      planTier: plan?.tier ?? "free",
      pendingPayment: d.subscriptions.some((s) => s.userId === u.id && s.status === "pending_payment"),
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    };
    rows.push(row);
  }
  const counts = {
    all: rows.length,
    ...(Object.fromEntries(SEGMENTS.map((s) => [s, rows.filter((r) => r.role === s).length])) as Record<Segment, number>),
  };
  const filtered = rows
    .filter((r) => {
      if (f.role && r.role !== f.role) return false;
      if (f.status && r.status !== f.status) return false;
      if (f.verification && r.verification !== f.verification) return false;
      if (q && ![r.name, r.contactName, r.email].join(" ").toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { rows: filtered, counts };
}

/* ------------------------------ Opportunities ------------------------------ */

export type AdminOpportunityRow = {
  id: string;
  title: string;
  companyName: string;
  businessId: string;
  typeLabel: string;
  category: MarketCategory;
  status: OpportunityStatus;
  featured: boolean;
  flagged: boolean;
  premium: boolean;
  applicants: number;
  createdAt: string;
};

export type AdminOpportunityFilters = { q?: string; category?: string; status?: string; flagged?: string };

export async function getAdminOpportunities(f: AdminOpportunityFilters = {}) {
  const d = db();
  const q = lc(f.q);
  const all = d.opportunities;
  const rows: AdminOpportunityRow[] = all
    .filter((o) => {
      if (f.category && o.category !== f.category) return false;
      if (f.status && o.status !== f.status) return false;
      if (f.flagged === "1" && !o.flagged) return false;
      if (f.flagged === "0" && o.flagged) return false;
      if (q && ![o.title, o.companyName, o.industry, o.location].join(" ").toLowerCase().includes(q)) return false;
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((o) => ({
      id: o.id,
      title: o.title,
      companyName: o.companyName,
      businessId: o.businessId,
      typeLabel: OPPORTUNITY_TYPE_LABEL[o.type],
      category: o.category,
      status: o.status,
      featured: o.featured,
      flagged: o.flagged,
      premium: o.premium,
      applicants: d.applications.filter((a) => a.opportunityId === o.id).length,
      createdAt: o.createdAt,
    }));
  return {
    rows,
    totals: {
      all: all.length,
      open: all.filter((o) => o.status === "open").length,
      flagged: all.filter((o) => o.flagged).length,
      featured: all.filter((o) => o.featured).length,
    },
  };
}

/* ------------------------------- Applications ------------------------------ */

export type AdminApplicationRow = {
  id: string;
  applicant: { id: string; name: string; role: string; avatarUrl?: string };
  talentName?: string;
  opportunity: { id: string; title: string; companyName: string; businessId: string };
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export async function getAdminApplications(f: { q?: string; status?: string } = {}) {
  const d = db();
  const q = lc(f.q);
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
  for (const a of d.applications) counts[a.status] += 1;

  const rows: AdminApplicationRow[] = [];
  for (const a of d.applications) {
    const o = d.opportunities.find((x) => x.id === a.opportunityId);
    if (!o) continue;
    const who = identity(d.users.find((u) => u.id === a.applicantId));
    const talentName = a.talentId ? d.talents.find((t) => t.id === a.talentId)?.name : undefined;
    if (f.status && a.status !== f.status) continue;
    if (q && ![who.name, who.email, talentName ?? "", o.title, o.companyName].join(" ").toLowerCase().includes(q)) continue;
    rows.push({
      id: a.id,
      applicant: { id: who.id, name: who.name, role: who.role, avatarUrl: who.avatarUrl },
      talentName,
      opportunity: { id: o.id, title: o.title, companyName: o.companyName, businessId: o.businessId },
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    });
  }
  rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return { rows, counts, total: d.applications.length };
}

/* --------------------------------- Reports --------------------------------- */

export type AdminReportRow = Report & {
  reporter: { id: string; name: string };
  target: {
    label: string;
    href: string | null;
    exists: boolean;
    /** For user targets: the reported user; for opportunity targets: the listing owner. */
    userId?: string;
    userStatus?: AccountStatus;
    opportunityFlagged?: boolean;
    opportunityStatus?: OpportunityStatus;
  };
};

export async function getAdminReports(f: { status?: string } = {}) {
  const d = db();
  const counts = { all: d.reports.length, open: 0, resolved: 0, dismissed: 0 };
  for (const r of d.reports) counts[r.status] += 1;
  const rows: AdminReportRow[] = d.reports
    .filter((r) => !f.status || r.status === f.status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => {
      const reporter = identity(d.users.find((u) => u.id === r.reporterId));
      let target: AdminReportRow["target"];
      if (r.targetType === "user") {
        const u = d.users.find((x) => x.id === r.targetId);
        target = u
          ? { label: identity(u).name, href: `/profiles/${u.id}`, exists: true, userId: u.id, userStatus: u.status }
          : { label: "Removed user", href: null, exists: false };
      } else {
        const o = d.opportunities.find((x) => x.id === r.targetId);
        const owner = o ? d.users.find((u) => u.id === o.businessId) : undefined;
        target = o
          ? {
              label: o.title,
              href: `/opportunities/${o.id}`,
              exists: true,
              userId: owner?.id,
              userStatus: owner?.status,
              opportunityFlagged: o.flagged,
              opportunityStatus: o.status,
            }
          : { label: "Removed opportunity", href: null, exists: false };
      }
      return { ...r, reporter: { id: reporter.id, name: reporter.name }, target };
    });
  return { rows, counts };
}

/* ------------------------------ Subscriptions ------------------------------ */

export type AdminSubscriptionRow = UserSubscription & {
  user: { id: string; name: string; email: string; role: string; avatarUrl?: string };
  plan: { id: string; name: string; segment: Segment; tier: "free" | "pro"; price: number } | null;
  live: boolean;
};

export async function getAdminSubscriptions(f: { status?: string } = {}) {
  const d = db();
  const counts: Record<"all" | SubscriptionStatus, number> = { all: d.subscriptions.length, active: 0, pending_payment: 0, canceled: 0, expired: 0 };
  for (const s of d.subscriptions) counts[s.status] += 1;
  const rows: AdminSubscriptionRow[] = d.subscriptions
    .filter((s) => !f.status || s.status === f.status)
    .sort((a, b) => {
      // Pending payments first, then newest.
      const pa = a.status === "pending_payment" ? 0 : 1;
      const pb = b.status === "pending_payment" ? 0 : 1;
      return pa - pb || b.createdAt.localeCompare(a.createdAt);
    })
    .map((s) => {
      const who = identity(d.users.find((u) => u.id === s.userId));
      const p = d.plans.find((x) => x.id === s.planId);
      return {
        ...s,
        user: { id: who.id, name: who.name, email: who.email, role: who.role, avatarUrl: who.avatarUrl },
        plan: p
          ? { id: p.id, name: p.name, segment: p.segment, tier: p.tier, price: s.billingCycle === "yearly" ? p.priceYearly : p.priceMonthly }
          : null,
        live: isLive(s),
      };
    });
  return { rows, counts };
}

export async function getSubscriptionEventLog(limit = 50) {
  const d = db();
  return [...d.subscriptionEvents]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map((e) => {
      const who = identity(d.users.find((u) => u.id === e.userId));
      return { ...e, userName: who.name, planName: d.plans.find((p) => p.id === e.planId)?.name ?? e.planId };
    });
}

/* -------------------------------- Taxonomy --------------------------------- */

export async function getAdminCategories(kind: CategoryKind) {
  const d = db();
  const all = d.categories;
  const counts = {
    industry: all.filter((c) => c.kind === "industry").length,
    niche: all.filter((c) => c.kind === "niche").length,
    location: all.filter((c) => c.kind === "location").length,
  };
  const rows = all
    .filter((c) => c.kind === kind)
    .map((c) => ({ ...c, usage: categoryUsage(kind, c.name) }))
    .sort((a, b) => Number(b.active) - Number(a.active) || a.name.localeCompare(b.name));
  return { rows, counts };
}

/** How many records reference a taxonomy value (gives admins context before disabling one). */
function categoryUsage(kind: CategoryKind, name: string) {
  const d = db();
  if (kind === "industry")
    return (
      d.opportunities.filter((o) => o.industry === name).length +
      d.businesses.filter((b) => b.industry === name).length +
      d.salesPartners.filter((s) => s.industries.includes(name)).length
    );
  if (kind === "niche") return d.creators.filter((c) => c.niches.includes(name)).length;
  return (
    d.opportunities.filter((o) => o.location === name).length +
    d.businesses.filter((b) => b.location === name).length +
    d.salesPartners.filter((s) => s.location === name || s.areas.includes(name)).length +
    d.creators.filter((c) => c.location === name).length +
    d.agencies.filter((a) => a.location === name).length
  );
}

/* --------------------------------- Overview -------------------------------- */

export async function getAdminOverview() {
  const d = db();
  const users = d.users.filter((u) => u.role !== "admin");

  const applicationsByStatus = APPLICATION_STATUSES.map((s) => ({ key: s, value: d.applications.filter((a) => a.status === s).length }));
  const opportunitiesByCategory = (["sales", "affiliate", "kol", "agency"] as MarketCategory[]).map((c) => ({
    key: c,
    value: d.opportunities.filter((o) => o.category === c).length,
  }));

  const pendingVerifications = users
    .filter((u) => u.verification === "pending")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((u) => ({ ...identity(u), createdAt: u.createdAt }));

  const openReports = d.reports
    .filter((r) => r.status === "open")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => {
      const targetName =
        r.targetType === "user"
          ? identity(d.users.find((u) => u.id === r.targetId)).name
          : (d.opportunities.find((o) => o.id === r.targetId)?.title ?? "Removed opportunity");
      return { id: r.id, reason: r.reason, targetType: r.targetType, targetName, createdAt: r.createdAt };
    });

  const pendingPayments = d.subscriptions
    .filter((s) => s.status === "pending_payment")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((s) => {
      const p = d.plans.find((x) => x.id === s.planId);
      return {
        id: s.id,
        userName: identity(d.users.find((u) => u.id === s.userId)).name,
        planName: p?.name ?? s.planId,
        amount: p ? (s.billingCycle === "yearly" ? p.priceYearly : p.priceMonthly) : 0,
        billingCycle: s.billingCycle,
        createdAt: s.createdAt,
      };
    });

  const recentSignups = [...users]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
    .map((u) => ({ ...identity(u), role: u.role as Segment, status: u.status, verification: u.verification, createdAt: u.createdAt }));

  return { applicationsByStatus, opportunitiesByCategory, pendingVerifications, openReports, pendingPayments, recentSignups };
}
