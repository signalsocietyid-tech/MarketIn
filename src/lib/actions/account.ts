"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { BillingCycle } from "@/lib/types";
import { commit, db } from "@/lib/data/store";
import { requireRole, requireUser } from "@/lib/auth/session";
import { getActiveSubscription, getPendingSubscription, getPlan } from "@/lib/data/queries";
import { getLimit, withinLimit } from "@/lib/permissions";
import { getPaymentProvider } from "@/lib/payments";
import {
  type ActionResult,
  agencyOnboardingSchema,
  businessOnboardingSchema,
  creatorOnboardingSchema,
  salesOnboardingSchema,
  talentSchema,
  teamInviteSchema,
  zodFieldErrors,
} from "@/lib/validation";
import { uid } from "@/lib/utils";

/* --------------------------------- Profile --------------------------------- */

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const d = db();
  const fail = (e: import("zod").ZodError) => ({ ok: false as const, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(e) });

  if (user.role === "business") {
    const p = businessOnboardingSchema.safeParse(input);
    if (!p.success) return fail(p.error);
    const b = d.businesses.find((x) => x.userId === user.id);
    if (!b) return { ok: false, error: "Profile not found." };
    Object.assign(b, p.data, { website: p.data.website || undefined, logoUrl: p.data.logoUrl || b.logoUrl });
    user.name = p.data.companyName;
    for (const o of d.opportunities) if (o.businessId === user.id) o.companyName = p.data.companyName;
  } else if (user.role === "sales") {
    const p = salesOnboardingSchema.safeParse(input);
    if (!p.success) return fail(p.error);
    const s = d.salesPartners.find((x) => x.userId === user.id);
    if (!s) return { ok: false, error: "Profile not found." };
    Object.assign(s, p.data);
    user.name = p.data.fullName;
  } else if (user.role === "creator") {
    const p = creatorOnboardingSchema.safeParse(input);
    if (!p.success) return fail(p.error);
    const c = d.creators.find((x) => x.userId === user.id);
    if (!c) return { ok: false, error: "Profile not found." };
    Object.assign(c, p.data);
    user.name = p.data.fullName;
  } else if (user.role === "agency") {
    const p = agencyOnboardingSchema.safeParse(input);
    if (!p.success) return fail(p.error);
    const a = d.agencies.find((x) => x.userId === user.id);
    if (!a) return { ok: false, error: "Profile not found." };
    Object.assign(a, p.data, { website: p.data.website || undefined });
    user.name = p.data.agencyName;
  } else {
    return { ok: false, error: "Admins don't have a public profile." };
  }
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Profile saved." };
}

export async function requestVerification(): Promise<ActionResult> {
  const user = await requireUser();
  if (user.verification === "verified") return { ok: true, message: "Your account is already verified." };
  user.verification = "pending";
  db().notifications.push({
    id: uid("n"),
    userId: "u_admin",
    title: "Verification request",
    body: `${user.name} requested account verification.`,
    href: "/admin/users?verification=pending",
    read: false,
    createdAt: new Date().toISOString(),
  });
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Verification requested. Our team will review your profile." };
}

/* ---------------------------------- Agency --------------------------------- */

export async function addTalent(input: unknown): Promise<ActionResult> {
  const user = await requireRole(["agency"]);
  const p = talentSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(p.error) };
  if (!(await withinLimit(user, "talentRoster"))) {
    return { ok: false, error: `Your plan allows up to ${await getLimit(user, "talentRoster")} talents. Upgrade to Agency Pro to expand your roster.` };
  }
  db().talents.push({
    id: uid("t"),
    agencyId: user.id,
    name: p.data.name,
    type: p.data.type,
    specialty: p.data.specialty,
    location: p.data.location,
    followers: typeof p.data.followers === "number" ? p.data.followers : undefined,
    status: "available",
    addedAt: new Date().toISOString(),
  });
  commit();
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Talent added to your roster." };
}

export async function setTalentStatus(id: string, status: "available" | "on_project" | "inactive"): Promise<ActionResult> {
  const user = await requireRole(["agency"]);
  const t = db().talents.find((x) => x.id === id && x.agencyId === user.id);
  if (!t) return { ok: false, error: "Talent not found." };
  t.status = status;
  commit();
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Talent updated." };
}

export async function removeTalent(id: string): Promise<ActionResult> {
  const user = await requireRole(["agency"]);
  const d = db();
  d.talents = d.talents.filter((t) => !(t.id === id && t.agencyId === user.id));
  commit();
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Talent removed." };
}

export async function inviteTeamMember(input: unknown): Promise<ActionResult> {
  const user = await requireRole(["agency"]);
  const p = teamInviteSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(p.error) };
  if (!(await withinLimit(user, "teamMembers"))) {
    return { ok: false, error: "Your plan doesn't include more team members. Agency Pro supports up to 10." };
  }
  const d = db();
  if (d.teamMembers.some((m) => m.agencyId === user.id && m.email.toLowerCase() === p.data.email.toLowerCase())) {
    return { ok: false, error: "This person is already on your team.", fieldErrors: { email: "Already invited" } };
  }
  d.teamMembers.push({ id: uid("tm"), agencyId: user.id, ...p.data, invitedAt: new Date().toISOString(), status: "invited" });
  commit();
  revalidatePath("/dashboard", "layout");
  // Invitation email delivery is not wired up yet (no mail provider configured).
  return { ok: true, message: "Invitation recorded. Email delivery will be enabled once a mail provider is configured." };
}

export async function removeTeamMember(id: string): Promise<ActionResult> {
  const user = await requireRole(["agency"]);
  const d = db();
  const m = d.teamMembers.find((x) => x.id === id && x.agencyId === user.id);
  if (!m) return { ok: false, error: "Member not found." };
  if (m.role === "owner") return { ok: false, error: "The agency owner can't be removed." };
  d.teamMembers = d.teamMembers.filter((x) => x.id !== id);
  commit();
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Member removed." };
}

/* --------------------------------- Billing --------------------------------- */

export async function startCheckout(planId: string, cycle: BillingCycle): Promise<ActionResult> {
  const user = await requireUser();
  const plan = await getPlan(planId);
  if (!plan || !plan.active || plan.segment !== user.role) return { ok: false, error: "This plan isn't available for your account type." };
  if (plan.tier === "free") return { ok: false, error: "The free plan doesn't require checkout." };
  const active = await getActiveSubscription(user.id);
  if (active?.planId === plan.id && active.billingCycle === cycle) return { ok: false, error: "You're already on this plan." };

  const d = db();
  // Only one pending checkout at a time.
  d.subscriptions = d.subscriptions.filter((s) => !(s.userId === user.id && s.status === "pending_payment"));

  const amount = cycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const orderId = uid("ord");
  let result;
  try {
    result = await getPaymentProvider().createCheckout({ user, plan, cycle, amount, orderId });
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const now = new Date();
  d.subscriptions.push({
    id: uid("sub"),
    userId: user.id,
    planId: plan.id,
    billingCycle: cycle,
    status: "pending_payment",
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: now.toISOString(),
    cancelAtPeriodEnd: false,
    paymentReference: result.reference,
    createdAt: now.toISOString(),
  });
  d.subscriptionEvents.push({
    id: uid("se"),
    userId: user.id,
    planId: plan.id,
    action: "upgrade_requested",
    billingCycle: cycle,
    amount,
    note: `Checkout created via ${result.provider} provider — awaiting payment confirmation`,
    createdAt: now.toISOString(),
  });
  commit();
  revalidatePath("/", "layout");
  if (result.redirectUrl) redirect(result.redirectUrl);
  redirect("/dashboard/billing?checkout=pending");
}

export async function cancelPendingCheckout(): Promise<ActionResult> {
  const user = await requireUser();
  const d = db();
  const pending = await getPendingSubscription(user.id);
  if (!pending) return { ok: false, error: "No pending checkout." };
  pending.status = "canceled";
  d.subscriptionEvents.push({ id: uid("se"), userId: user.id, planId: pending.planId, action: "canceled", billingCycle: pending.billingCycle, amount: 0, note: "Pending checkout canceled", createdAt: new Date().toISOString() });
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Pending checkout canceled." };
}

/** Downgrade to free at the end of the current period. */
export async function scheduleDowngrade(): Promise<ActionResult> {
  const user = await requireUser();
  const sub = await getActiveSubscription(user.id);
  if (!sub) return { ok: false, error: "You're already on the free plan." };
  sub.cancelAtPeriodEnd = true;
  db().subscriptionEvents.push({ id: uid("se"), userId: user.id, planId: sub.planId, action: "downgraded", billingCycle: sub.billingCycle, amount: 0, note: "Scheduled downgrade to Free at period end", createdAt: new Date().toISOString() });
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Your plan will switch to Free at the end of the current period." };
}

export async function resumeSubscription(): Promise<ActionResult> {
  const user = await requireUser();
  const sub = await getActiveSubscription(user.id);
  if (!sub || !sub.cancelAtPeriodEnd) return { ok: false, error: "Nothing to resume." };
  sub.cancelAtPeriodEnd = false;
  db().subscriptionEvents.push({ id: uid("se"), userId: user.id, planId: sub.planId, action: "resumed", billingCycle: sub.billingCycle, amount: 0, createdAt: new Date().toISOString() });
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Your subscription will continue." };
}

