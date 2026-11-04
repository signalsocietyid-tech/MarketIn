"use server";

import { revalidatePath } from "next/cache";
import type { ApplicationStatus, OpportunityStatus } from "@/lib/types";
import { data, write, type Tx } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth/session";
import { getLimit, hasFeature, roleCan, withinLimit } from "@/lib/permissions";
import { OPPORTUNITY_TYPE_CATEGORY, APPLICATION_STATUS_LABEL } from "@/lib/constants";
import {
  type ActionResult,
  applicationSchema,
  opportunitySchema,
  reportSchema,
  reviewSchema,
  zodFieldErrors,
} from "@/lib/validation";
import { newId } from "@/lib/utils";

function notify(tx: Tx, userId: string, title: string, body: string, href?: string) {
  return tx.insert("notifications", { id: newId(), userId, title, body, href, read: false, createdAt: new Date().toISOString() });
}

const lines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

/* ------------------------------ Opportunities ------------------------------ */

export async function saveOpportunity(input: unknown, id?: string): Promise<ActionResult<{ id: string }>> {
  const user = await requireUser();
  if (!roleCan(user.role, "publishOpportunity")) return { ok: false, error: "Only business accounts can publish opportunities." };
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  const v = parsed.data;
  const d = await data();

  if (v.premium && !(await hasFeature(user, "priority_visibility"))) {
    return { ok: false, error: "Premium listings require a plan with priority visibility." };
  }

  const fields = {
    title: v.title,
    type: v.type,
    category: OPPORTUNITY_TYPE_CATEGORY[v.type],
    industry: v.industry,
    location: v.location,
    remote: v.remote,
    description: v.description,
    requirements: lines(v.requirements),
    deliverables: lines(v.deliverables),
    compensationModel: v.compensationModel,
    compensationDetail: v.compensationDetail,
    budgetMin: typeof v.budgetMin === "number" ? v.budgetMin : undefined,
    budgetMax: typeof v.budgetMax === "number" ? v.budgetMax : undefined,
    experienceLevel: v.experienceLevel,
    platforms: v.platforms,
    deadline: new Date(v.deadline).toISOString(),
    duration: v.duration,
    premium: v.premium,
  };

  if (id) {
    const existing = d.opportunities.find((o) => o.id === id);
    if (!existing || existing.businessId !== user.id) return { ok: false, error: "Opportunity not found." };
    await write((tx) => tx.update("opportunities", id, fields));
    revalidatePath("/", "layout");
    return { ok: true, message: "Opportunity updated.", data: { id } };
  }

  if (!(await withinLimit(user, "activeOpportunities"))) {
    const limit = await getLimit(user, "activeOpportunities");
    return { ok: false, error: `Your plan allows ${limit} active opportunities. Pause or close one, or upgrade your plan.` };
  }

  const profile = d.businesses.find((b) => b.userId === user.id);
  const opportunityId = newId();
  await write((tx) =>
    tx.insert("opportunities", {
      id: opportunityId,
      businessId: user.id,
      companyName: profile?.companyName ?? user.name,
      ...fields,
      status: "open",
      featured: false,
      flagged: false,
      views: 0,
      createdAt: new Date().toISOString(),
    }),
  );
  revalidatePath("/", "layout");
  return { ok: true, message: "Opportunity published.", data: { id: opportunityId } };
}

export async function setOpportunityStatus(id: string, status: OpportunityStatus): Promise<ActionResult> {
  const user = await requireUser();
  const o = (await data()).opportunities.find((x) => x.id === id);
  if (!o || (o.businessId !== user.id && user.role !== "admin")) return { ok: false, error: "Opportunity not found." };
  if (status === "open" && o.status !== "open" && user.role !== "admin" && !(await withinLimit(user, "activeOpportunities"))) {
    return { ok: false, error: "You have reached your active opportunity limit." };
  }
  await write((tx) => tx.update("opportunities", id, { status }));
  revalidatePath("/", "layout");
  return { ok: true, message: `Opportunity ${status === "open" ? "reopened" : status}.` };
}

/* ------------------------------- Applications ------------------------------ */

export async function applyToOpportunity(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to apply." };
  if (!roleCan(user.role, "applyToOpportunity")) return { ok: false, error: "Business accounts can't apply to opportunities." };
  const parsed = applicationSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  const d = await data();
  const o = d.opportunities.find((x) => x.id === parsed.data.opportunityId);
  const owner = o && d.users.find((u) => u.id === o.businessId);
  if (!o || o.status !== "open" || o.flagged || !owner || owner.status === "suspended" || new Date(o.deadline).getTime() < Date.now()) {
    return { ok: false, error: "This opportunity is no longer accepting applications." };
  }
  if (o.premium && !(await hasFeature(user, "premium_opportunities"))) {
    return { ok: false, error: "This is a premium opportunity. Upgrade to Pro to apply." };
  }
  const talentId = parsed.data.talentId || undefined;
  if (d.applications.some((a) => a.opportunityId === o.id && a.applicantId === user.id && a.talentId === talentId)) {
    return { ok: false, error: "You have already applied to this opportunity." };
  }
  if (!(await withinLimit(user, "monthlyApplications"))) {
    return { ok: false, error: "You've reached this month's application limit on your plan." };
  }
  if (talentId && !d.talents.some((t) => t.id === talentId && t.agencyId === user.id)) {
    return { ok: false, error: "Select a talent from your roster." };
  }
  const now = new Date().toISOString();
  await write(async (tx) => {
    await tx.insert("applications", {
      id: newId(),
      opportunityId: o.id,
      applicantId: user.id,
      talentId,
      message: parsed.data.message,
      proposedRate: parsed.data.proposedRate || undefined,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });
    await notify(tx, o.businessId, "New application", `${user.name} applied to ${o.title}.`, `/dashboard/opportunities/${o.id}`);
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Application sent. You can track it in your dashboard." };
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<ActionResult> {
  const user = await requireUser();
  const d = await data();
  const a = d.applications.find((x) => x.id === applicationId);
  const o = a && d.opportunities.find((x) => x.id === a.opportunityId);
  if (!a || !o || (o.businessId !== user.id && user.role !== "admin")) return { ok: false, error: "Application not found." };
  const now = new Date().toISOString();
  const existing = d.partnerships.find((p) => p.applicationId === a.id);

  await write(async (tx) => {
    await tx.update("applications", a.id, { status, updatedAt: now });
    // Accepting an application opens a partnership; completing one closes it.
    if (status === "accepted" && !existing) {
      await tx.insert("partnerships", {
        id: newId(),
        opportunityId: o.id,
        applicationId: a.id,
        businessId: o.businessId,
        partnerId: a.applicantId,
        status: "active",
        startDate: now,
        metrics: { leads: 0, conversions: 0, revenue: 0, contentPieces: 0, reach: 0 },
      });
    }
    if (status === "completed" && existing) {
      await tx.update("partnerships", existing.id, { status: "completed", endDate: now });
    }
    await notify(
      tx,
      a.applicantId,
      `Application ${APPLICATION_STATUS_LABEL[status].toLowerCase()}`,
      `${o.companyName} updated your application for ${o.title} to ${APPLICATION_STATUS_LABEL[status]}.`,
      status === "accepted" ? "/dashboard/partnerships" : "/dashboard/applications",
    );
  });
  revalidatePath("/", "layout");
  return { ok: true, message: `Marked as ${APPLICATION_STATUS_LABEL[status]}.` };
}

export async function withdrawApplication(applicationId: string): Promise<ActionResult> {
  const user = await requireUser();
  const a = (await data()).applications.find((x) => x.id === applicationId && x.applicantId === user.id);
  if (!a) return { ok: false, error: "Application not found." };
  if (!["pending", "under_review"].includes(a.status)) {
    return { ok: false, error: "Only pending or under-review applications can be withdrawn." };
  }
  await write((tx) => tx.remove("applications", { id: a.id, applicantId: user.id }));
  revalidatePath("/", "layout");
  return { ok: true, message: "Application withdrawn." };
}

/* --------------------------------- Saving ---------------------------------- */

export async function toggleSaved(targetType: "opportunity" | "profile", targetId: string): Promise<ActionResult<{ saved: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to save items." };
  if (targetType === "profile" && !roleCan(user.role, "savePartners")) return { ok: false, error: "Only business and agency accounts can save partner profiles." };
  const d = await data();
  const exists = targetType === "opportunity" ? d.opportunities.some((o) => o.id === targetId) : d.users.some((u) => u.id === targetId && u.role !== "admin");
  if (!exists) return { ok: false, error: "This item is no longer available." };
  const key = { userId: user.id, targetType, targetId };
  if (d.saved.some((s) => s.userId === user.id && s.targetType === targetType && s.targetId === targetId)) {
    await write((tx) => tx.remove("saved", key));
    revalidatePath("/", "layout");
    return { ok: true, message: "Removed from saved.", data: { saved: false } };
  }
  if (!(await withinLimit(user, "savedItems"))) return { ok: false, error: "You've reached the saved items limit on your plan." };
  await write((tx) => tx.insert("saved", { ...key, createdAt: new Date().toISOString() }));
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved.", data: { saved: true } };
}

/* --------------------------- Reviews & reports ----------------------------- */

export async function leaveReview(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  const d = await data();
  const p = d.partnerships.find((x) => x.id === parsed.data.partnershipId);
  if (!p || (p.businessId !== user.id && p.partnerId !== user.id)) return { ok: false, error: "Partnership not found." };
  if (d.reviews.some((r) => r.partnershipId === p.id && r.reviewerId === user.id)) return { ok: false, error: "You already reviewed this partnership." };
  const revieweeId = p.businessId === user.id ? p.partnerId : p.businessId;
  await write(async (tx) => {
    await tx.insert("reviews", { id: newId(), reviewerId: user.id, revieweeId, partnershipId: p.id, rating: parsed.data.rating, comment: parsed.data.comment, createdAt: new Date().toISOString() });
    await notify(tx, revieweeId, "New review", `${user.name} left you a ${parsed.data.rating}-star review.`, `/profiles/${revieweeId}`);
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "Review published." };
}

export async function setPartnershipStatus(partnershipId: string, status: "active" | "paused" | "completed"): Promise<ActionResult> {
  const user = await requireUser();
  const p = (await data()).partnerships.find((x) => x.id === partnershipId);
  if (!p || (p.businessId !== user.id && p.partnerId !== user.id)) return { ok: false, error: "Partnership not found." };
  await write(async (tx) => {
    await tx.update("partnerships", p.id, { status, endDate: status === "completed" ? new Date().toISOString() : undefined });
    if (status === "completed") await tx.update("applications", p.applicationId, { status: "completed", updatedAt: new Date().toISOString() });
  });
  revalidatePath("/", "layout");
  return { ok: true, message: `Partnership marked ${status}.` };
}

export async function submitReport(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to report content." };
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please choose a reason." };
  const d = await data();
  const { targetType, targetId } = parsed.data;
  const exists = targetType === "opportunity" ? d.opportunities.some((o) => o.id === targetId) : d.users.some((u) => u.id === targetId);
  if (!exists) return { ok: false, error: "This item is no longer available." };
  await write((tx) => tx.insert("reports", { id: newId(), reporterId: user.id, ...parsed.data, status: "open", createdAt: new Date().toISOString() }));
  return { ok: true, message: "Thanks — our team will review this report." };
}

/* ------------------------------ Notifications ------------------------------ */

export async function markNotificationsRead(id?: string): Promise<ActionResult> {
  const user = await requireUser();
  const d = await data();
  if (id && !d.notifications.some((n) => n.id === id && n.userId === user.id)) return { ok: false, error: "Notification not found." };
  await write((tx) =>
    id
      ? tx.update("notifications", id, { read: true })
      : tx.q.query("update public.notifications set read = true where user_id = $1 and not read", [user.id]).then(() => undefined),
  );
  revalidatePath("/", "layout");
  return { ok: true };
}
