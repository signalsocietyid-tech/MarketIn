"use server";

import { revalidatePath } from "next/cache";
import type { AccountStatus, CategoryKind, FeatureKey, VerificationStatus } from "@/lib/types";
import { data, isEmbedded, write } from "@/lib/db";
import { resetEmbedded } from "@/lib/db/client";
import { requireRole } from "@/lib/auth/session";
import { type ActionResult, planUpdateSchema, zodFieldErrors } from "@/lib/validation";
import { newId } from "@/lib/utils";

const requireAdmin = () => requireRole(["admin"]);

function done(message: string): ActionResult {
  revalidatePath("/", "layout");
  return { ok: true, message };
}

export async function setAccountStatus(userId: string, status: AccountStatus): Promise<ActionResult> {
  await requireAdmin();
  const u = (await data()).users.find((x) => x.id === userId);
  if (!u || u.role === "admin") return { ok: false, error: "User not found." };
  await write((tx) => tx.update("users", userId, { status }));
  return done(`Account ${status === "active" ? "activated" : status}.`);
}

export async function setVerification(userId: string, verification: VerificationStatus): Promise<ActionResult> {
  await requireAdmin();
  const u = (await data()).users.find((x) => x.id === userId);
  if (!u || u.role === "admin") return { ok: false, error: "User not found." };
  await write(async (tx) => {
    await tx.update("users", userId, { verification });
    if (verification === "verified" || verification === "rejected") {
      await tx.insert("notifications", {
        id: newId(),
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
  });
  return done(`Verification set to ${verification}.`);
}

export async function moderateOpportunity(id: string, action: "flag" | "unflag" | "feature" | "unfeature" | "close" | "reopen"): Promise<ActionResult> {
  await requireAdmin();
  if (!(await data()).opportunities.some((x) => x.id === id)) return { ok: false, error: "Opportunity not found." };
  const patch = {
    flag: { flagged: true },
    unflag: { flagged: false },
    feature: { featured: true },
    unfeature: { featured: false },
    close: { status: "closed" as const },
    reopen: { status: "open" as const },
  }[action];
  await write((tx) => tx.update("opportunities", id, patch));
  return done("Opportunity updated.");
}

export async function resolveReport(id: string, status: "resolved" | "dismissed" | "open"): Promise<ActionResult> {
  await requireAdmin();
  if (!(await data()).reports.some((x) => x.id === id)) return { ok: false, error: "Report not found." };
  await write((tx) => tx.update("reports", id, { status }));
  return done(`Report ${status}.`);
}

/** Manual activation — used until a payment gateway confirms payments automatically. */
export async function adminActivateSubscription(subscriptionId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  const d = await data();
  const s = d.subscriptions.find((x) => x.id === subscriptionId);
  if (!s) return { ok: false, error: "Subscription not found." };
  const plan = d.plans.find((p) => p.id === s.planId);
  const start = new Date();
  const end = new Date(start);
  if (s.billingCycle === "yearly") end.setFullYear(end.getFullYear() + 1);
  else end.setMonth(end.getMonth() + 1);

  await write(async (tx) => {
    // Close any other live subscription first (one active subscription per user).
    await tx.q.query("update public.user_subscriptions set status = 'canceled' where user_id = $1 and id <> $2 and status = 'active'", [s.userId, s.id]);
    await tx.update("subscriptions", s.id, {
      status: "active",
      currentPeriodStart: start.toISOString(),
      currentPeriodEnd: end.toISOString(),
      cancelAtPeriodEnd: false,
    });
    await tx.insert("subscriptionEvents", {
      id: newId(),
      userId: s.userId,
      planId: s.planId,
      action: "activated",
      billingCycle: s.billingCycle,
      amount: plan ? (s.billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly) : 0,
      note: `Manually activated by ${admin.name}`,
      createdAt: start.toISOString(),
    });
    await tx.insert("notifications", { id: newId(), userId: s.userId, title: "Subscription active", body: `${plan?.name ?? "Your plan"} is now active.`, href: "/dashboard/billing", read: false, createdAt: start.toISOString() });
  });
  return done("Subscription activated.");
}

export async function adminCancelSubscription(subscriptionId: string): Promise<ActionResult> {
  await requireAdmin();
  const s = (await data()).subscriptions.find((x) => x.id === subscriptionId);
  if (!s) return { ok: false, error: "Subscription not found." };
  await write(async (tx) => {
    await tx.update("subscriptions", s.id, { status: "canceled" });
    await tx.insert("subscriptionEvents", { id: newId(), userId: s.userId, planId: s.planId, action: "canceled", billingCycle: s.billingCycle, amount: 0, note: "Canceled by admin", createdAt: new Date().toISOString() });
  });
  return done("Subscription canceled.");
}

export async function updatePlan(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const p = planUpdateSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Please check the plan fields.", fieldErrors: zodFieldErrors(p.error) };
  const plan = (await data()).plans.find((x) => x.id === p.data.id);
  if (!plan) return { ok: false, error: "Plan not found." };
  const { id, ...fields } = p.data;
  await write(async (tx) => {
    if (fields.recommended) {
      await tx.q.query("update public.subscription_plans set recommended = false where segment = $1 and id <> $2", [plan.segment, id]);
    }
    await tx.update("plans", id, { ...fields, entitlements: fields.entitlements as FeatureKey[] });
  });
  return done(`${fields.name} saved.`);
}

export async function addCategory(kind: CategoryKind, name: string): Promise<ActionResult> {
  await requireAdmin();
  const n = name.trim();
  if (n.length < 2) return { ok: false, error: "Name is too short." };
  if ((await data()).categories.some((c) => c.kind === kind && c.name.toLowerCase() === n.toLowerCase())) return { ok: false, error: "Category already exists." };
  await write((tx) => tx.insert("categories", { id: newId(), kind, name: n, active: true }));
  return done("Category added.");
}

export async function toggleCategory(id: string): Promise<ActionResult> {
  await requireAdmin();
  const c = (await data()).categories.find((x) => x.id === id);
  if (!c) return { ok: false, error: "Category not found." };
  await write((tx) => tx.update("categories", id, { active: !c.active }));
  return done(!c.active ? "Category enabled." : "Category disabled.");
}

export async function resetDemoData(): Promise<ActionResult> {
  await requireAdmin();
  if (!isEmbedded()) return { ok: false, error: "Only available on the embedded demo database." };
  await resetEmbedded();
  revalidatePath("/", "layout");
  return { ok: true, message: "Demo data restored." };
}
