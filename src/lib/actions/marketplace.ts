"use server";

import { revalidatePath } from "next/cache";
import type { ApplicationStatus, OpportunityStatus } from "@/lib/types";
import { commit, db } from "@/lib/data/store";
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
import { uid } from "@/lib/utils";

function notify(userId: string, title: string, body: string, href?: string) {
  db().notifications.push({ id: uid("n"), userId, title, body, href, read: false, createdAt: new Date().toISOString() });
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
  const d = db();

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
    Object.assign(existing, fields);
    commit();
    revalidatePath("/", "layout");
    return { ok: true, message: "Opportunity updated.", data: { id } };
  }

  if (!(await withinLimit(user, "activeOpportunities"))) {
    const limit = await getLimit(user, "activeOpportunities");
    return { ok: false, error: `Your plan allows ${limit} active opportunities. Pause or close one, or upgrade your plan.` };
  }

  const profile = d.businesses.find((b) => b.userId === user.id);
  const newId = uid("op");
  d.opportunities.push({
    id: newId,
    businessId: user.id,
    companyName: profile?.companyName ?? user.name,
    ...fields,
    status: "open",
    featured: false,
    flagged: false,
    views: 0,
    createdAt: new Date().toISOString(),
  });
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Opportunity published.", data: { id: newId } };
}

export async function setOpportunityStatus(id: string, status: OpportunityStatus): Promise<ActionResult> {
  const user = await requireUser();
  const o = db().opportunities.find((x) => x.id === id);
  if (!o || (o.businessId !== user.id && user.role !== "admin")) return { ok: false, error: "Opportunity not found." };
  if (status === "open" && o.status !== "open" && user.role !== "admin" && !(await withinLimit(user, "activeOpportunities"))) {
    return { ok: false, error: "You have reached your active opportunity limit." };
  }
  o.status = status;
  commit();
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
  const d = db();
  const o = d.opportunities.find((x) => x.id === parsed.data.opportunityId);
  const owner = o && d.users.find((u) => u.id === o.businessId);
  if (!o || o.status !== "open" || o.flagged || !owner || owner.status === "suspended" || new Date(o.deadline).getTime() < Date.now()) {
    return { ok: false, error: "This opportunity is no longer accepting applications." };
  }
  if (o.premium && !(await hasFeature(user, "premium_opportunities"))) {
    return { ok: false, error: "This is a premium opportunity. Upgrade to Pro to apply." };
  }
  if (d.applications.some((a) => a.opportunityId === o.id && a.applicantId === user.id && (!parsed.data.talentId || a.talentId === parsed.data.talentId))) {
    return { ok: false, error: "You have already applied to this opportunity." };
  }
  if (!(await withinLimit(user, "monthlyApplications"))) {
    return { ok: false, error: "You've reached this month's application limit on your plan." };
  }
  if (parsed.data.talentId && !d.talents.some((t) => t.id === parsed.data.talentId && t.agencyId === user.id)) {
    return { ok: false, error: "Select a talent from your roster." };
  }
  const now = new Date().toISOString();
  d.applications.push({
    id: uid("ap"),
    opportunityId: o.id,
    applicantId: user.id,
    talentId: parsed.data.talentId || undefined,
    message: parsed.data.message,
    proposedRate: parsed.data.proposedRate || undefined,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
  notify(o.businessId, "New application", `${user.name} applied to ${o.title}.`, `/dashboard/opportunities/${o.id}`);
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Application sent. You can track it in your dashboard." };
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<ActionResult> {
  const user = await requireUser();
  const d = db();
  const a = d.applications.find((x) => x.id === applicationId);
  const o = a && d.opportunities.find((x) => x.id === a.opportunityId);
  if (!a || !o || (o.businessId !== user.id && user.role !== "admin")) return { ok: false, error: "Application not found." };
  a.status = status;
  a.updatedAt = new Date().toISOString();

  // Accepting an application opens a partnership; completing one closes it.
  const existing = d.partnerships.find((p) => p.applicationId === a.id);
  if (status === "accepted" && !existing) {
    d.partnerships.push({
      id: uid("pa"),
      opportunityId: o.id,
      applicationId: a.id,
      businessId: o.businessId,
      partnerId: a.applicantId,
      status: "active",
      startDate: a.updatedAt,
      metrics: { leads: 0, conversions: 0, revenue: 0, contentPieces: 0, reach: 0 },
    });
  }
  if (status === "completed" && existing) {
    existing.status = "completed";
    existing.endDate = a.updatedAt;
  }
  notify(
    a.applicantId,
    `Application ${APPLICATION_STATUS_LABEL[status].toLowerCase()}`,
    `${o.companyName} updated your application for ${o.title} to ${APPLICATION_STATUS_LABEL[status]}.`,
    status === "accepted" ? "/dashboard/partnerships" : "/dashboard/applications",
  );
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: `Marked as ${APPLICATION_STATUS_LABEL[status]}.` };
}

export async function withdrawApplication(applicationId: string): Promise<ActionResult> {
  const user = await requireUser();
  const d = db();
  const idx = d.applications.findIndex((a) => a.id === applicationId && a.applicantId === user.id);
  if (idx < 0) return { ok: false, error: "Application not found." };
  if (!["pending", "under_review"].includes(d.applications[idx].status)) {
    return { ok: false, error: "Only pending or under-review applications can be withdrawn." };
  }
  d.applications.splice(idx, 1);
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Application withdrawn." };
}

/* --------------------------------- Saving ---------------------------------- */

export async function toggleSaved(targetType: "opportunity" | "profile", targetId: string): Promise<ActionResult<{ saved: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to save items." };
  if (targetType === "profile" && !roleCan(user.role, "savePartners")) return { ok: false, error: "Only business and agency accounts can save partner profiles." };
  const d = db();
  const idx = d.saved.findIndex((s) => s.userId === user.id && s.targetType === targetType && s.targetId === targetId);
  if (idx >= 0) {
    d.saved.splice(idx, 1);
    commit();
    revalidatePath("/", "layout");
    return { ok: true, message: "Removed from saved.", data: { saved: false } };
  }
  if (!(await withinLimit(user, "savedItems"))) return { ok: false, error: "You've reached the saved items limit on your plan." };
  d.saved.push({ userId: user.id, targetType, targetId, createdAt: new Date().toISOString() });
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Saved.", data: { saved: true } };
}

/* --------------------------- Reviews & reports ----------------------------- */

export async function leaveReview(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  const d = db();
  const p = d.partnerships.find((x) => x.id === parsed.data.partnershipId);
  if (!p || (p.businessId !== user.id && p.partnerId !== user.id)) return { ok: false, error: "Partnership not found." };
  if (d.reviews.some((r) => r.partnershipId === p.id && r.reviewerId === user.id)) return { ok: false, error: "You already reviewed this partnership." };
  const revieweeId = p.businessId === user.id ? p.partnerId : p.businessId;
  d.reviews.push({ id: uid("rv"), reviewerId: user.id, revieweeId, partnershipId: p.id, rating: parsed.data.rating, comment: parsed.data.comment, createdAt: new Date().toISOString() });
  notify(revieweeId, "New review", `${user.name} left you a ${parsed.data.rating}-star review.`, `/profiles/${revieweeId}`);
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: "Review published." };
}

export async function setPartnershipStatus(partnershipId: string, status: "active" | "paused" | "completed"): Promise<ActionResult> {
  const user = await requireUser();
  const p = db().partnerships.find((x) => x.id === partnershipId);
  if (!p || (p.businessId !== user.id && p.partnerId !== user.id)) return { ok: false, error: "Partnership not found." };
  p.status = status;
  p.endDate = status === "completed" ? new Date().toISOString() : undefined;
  const app = db().applications.find((a) => a.id === p.applicationId);
  if (app && status === "completed") app.status = "completed";
  commit();
  revalidatePath("/", "layout");
  return { ok: true, message: `Partnership marked ${status}.` };
}

export async function submitReport(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Sign in to report content." };
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please choose a reason." };
  db().reports.push({ id: uid("rp"), reporterId: user.id, ...parsed.data, status: "open", createdAt: new Date().toISOString() });
  commit();
  return { ok: true, message: "Thanks — our team will review this report." };
}

/* ------------------------------ Notifications ------------------------------ */

export async function markNotificationsRead(id?: string): Promise<ActionResult> {
  const user = await requireUser();
  for (const n of db().notifications) if (n.userId === user.id && (!id || n.id === id)) n.read = true;
  commit();
  revalidatePath("/", "layout");
  return { ok: true };
}
