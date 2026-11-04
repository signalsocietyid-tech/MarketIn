"use server";

import { revalidatePath } from "next/cache";
import type { AccountStatus, CategoryKind, FeatureKey, VerificationStatus } from "@/lib/types";
import { commit, db, resetStore } from "@/lib/data/store";
import { requireRole } from "@/lib/auth/session";
import { type ActionResult, planUpdateSchema, zodFieldErrors } from "@/lib/validation";
import { uid } from "@/lib/utils";

const requireAdmin = () => requireRole(["admin"]);

function done(message: string): ActionResult {
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message };
}

export async function setAccountStatus(userId: string, status: AccountStatus): Promise<ActionResult> {
  await requireAdmin();
  const u = db().users.find((x) => x.id === userId);
  if (!u || u.role === "admin") return { ok: false, error: "User not found." };
  u.status = status;
  return done(`Account ${status === "active" ? "activated" : status}.`);
}

export async function setVerification(userId: string, verification: VerificationStatus): Promise<ActionResult> {
  await requireAdmin();
  const u = db().users.find((x) => x.id === userId);
  if (!u || u.role === "admin") return { ok: false, error: "User not found." };
  u.verification = verification;
  if (verification === "verified" || verification === "rejected") {
    db().notifications.push({
      id: uid("n"),
      userId,
      title: verification === "verified" ? "Your account is verified" : "Verification not approved",
      body:
        verification === "verified"
          ? "A verified badge now appears on your profile."
          : "We couldn't verify your account yet. Update your profile and request again.",
      href: "/profile",
      read: false,
      createdAt: new Date().toISOString(),
    });
  }
  return done(`Verification set to ${verification}.`);
}

export async function moderateOpportunity(id: string, action: "flag" | "unflag" | "feature" | "unfeature" | "close" | "reopen"): Promise<ActionResult> {
  await requireAdmin();
  const o = db().opportunities.find((x) => x.id === id);
  if (!o) return { ok: false, error: "Opportunity not found." };
  if (action === "flag") o.flagged = true;
  if (action === "unflag") o.flagged = false;
  if (action === "feature") o.featured = true;
  if (action === "unfeature") o.featured = false;
  if (action === "close") o.status = "closed";
  if (action === "reopen") o.status = "open";
  return done("Opportunity updated.");
}

export async function resolveReport(id: string, status: "resolved" | "dismissed" | "open"): Promise<ActionResult> {
  await requireAdmin();
  const r = db().reports.find((x) => x.id === id);
  if (!r) return { ok: false, error: "Report not found." };
  r.status = status;
  return done(`Report ${status}.`);
}

/** Manual activation — used until a payment gateway confirms payments automatically. */
export async function adminActivateSubscription(subscriptionId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const d = db();
  const s = d.subscriptions.find((x) => x.id === subscriptionId);
  if (!s) return { ok: false, error: "Subscription not found." };
  const plan = d.plans.find((p) => p.id === s.planId);
  // Close any other live subscription for this user.
  for (const other of d.subscriptions) if (other.userId === s.userId && other.id !== s.id && other.status === "active") other.status = "canceled";
  const start = new Date();
  const end = new Date(start);
  if (s.billingCycle === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);
  s.status = "active";
  s.currentPeriodStart = start.toISOString();
  s.currentPeriodEnd = end.toISOString();
  s.cancelAtPeriodEnd = false;
  d.subscriptionEvents.push({
    id: uid("se"),
    userId: s.userId,
    planId: s.planId,
    action: "activated",
    billingCycle: s.billingCycle,
    amount: plan ? (s.billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly) : 0,
    note: `Manually activated by ${admin.name}`,
    createdAt: start.toISOString(),
  });
  d.notifications.push({ id: uid("n"), userId: s.userId, title: "Subscription active", body: `${plan?.name ?? "Your plan"} is now active.`, href: "/dashboard/billing", read: false, createdAt: start.toISOString() });
  return done("Subscription activated.");
}

export async function adminCancelSubscription(subscriptionId: string): Promise<ActionResult> {
  await requireAdmin();
  const d = db();
  const s = d.subscriptions.find((x) => x.id === subscriptionId);
  if (!s) return { ok: false, error: "Subscription not found." };
  s.status = "canceled";
  d.subscriptionEvents.push({ id: uid("se"), userId: s.userId, planId: s.planId, action: "canceled", billingCycle: s.billingCycle, amount: 0, note: "Canceled by admin", createdAt: new Date().toISOString() });
  return done("Subscription canceled.");
}

export async function updatePlan(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const p = planUpdateSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Please check the plan fields.", fieldErrors: zodFieldErrors(p.error) };
  const d = db();
  const plan = d.plans.find((x) => x.id === p.data.id);
  if (!plan) return { ok: false, error: "Plan not found." };
  Object.assign(plan, { ...p.data, entitlements: p.data.entitlements as FeatureKey[] });
  if (p.data.recommended) for (const other of d.plans) if (other.segment === plan.segment && other.id !== plan.id) other.recommended = false;
  return done(`${plan.name} saved.`);
}

export async function addCategory(kind: CategoryKind, name: string): Promise<ActionResult> {
  await requireAdmin();
  const n = name.trim();
  if (n.length < 2) return { ok: false, error: "Name is too short." };
  if (db().categories.some((c) => c.kind === kind && c.name.toLowerCase() === n.toLowerCase())) return { ok: false, error: "Category already exists." };
  db().categories.push({ id: uid("cat"), kind, name: n, active: true });
  return done("Category added.");
}

export async function toggleCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const c = db().categories.find((x) => x.id === id);
  if (!c) return { ok: false, error: "Category not found." };
  c.active = !c.active;
  return done(c.active ? "Category enabled." : "Category disabled.");
}

export async function resetDemoData(): Promise<ActionResult> {
  await requireAdmin();
  if ((process.env.DATA_PROVIDER ?? "mock") !== "mock") return { ok: false, error: "Only available with mock data." };
  resetStore();
  revalidatePath("/", "layout");
  return { ok: true, message: "Demo data restored." };
}
