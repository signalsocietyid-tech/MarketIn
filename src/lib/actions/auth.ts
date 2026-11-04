"use server";

import { redirect } from "next/navigation";
import type { Segment, User } from "@/lib/types";
import { commit, db } from "@/lib/data/store";
import { getUserByEmail } from "@/lib/data/queries";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, requireUser } from "@/lib/auth/session";
import {
  type ActionResult,
  loginSchema,
  passwordChangeSchema,
  registerSchema,
  zodFieldErrors,
} from "@/lib/validation";
import { uid } from "@/lib/utils";

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function registerAccount(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  }
  const { role, account, profile } = parsed.data;
  if (await getUserByEmail(account.email)) {
    return { ok: false, error: "An account with this email already exists.", fieldErrors: { "account.email": "Email already registered" } };
  }

  const d = db();
  const now = new Date().toISOString();
  const name =
    role === "business" ? profile.companyName : role === "agency" ? profile.agencyName : profile.fullName;
  const user: User = {
    id: uid("u"),
    email: account.email,
    passwordHash: hashPassword(account.password),
    role,
    name,
    status: "active",
    verification: "unverified",
    createdAt: now,
    lastActiveAt: now,
  };
  d.users.push(user);

  if (role === "business") d.businesses.push({ userId: user.id, ...profile, website: profile.website || undefined });
  if (role === "sales") d.salesPartners.push({ userId: user.id, ...profile });
  if (role === "creator") d.creators.push({ userId: user.id, ...profile });
  if (role === "agency") {
    d.agencies.push({ userId: user.id, ...profile, website: profile.website || undefined });
    d.teamMembers.push({ id: uid("tm"), agencyId: user.id, name: profile.agencyName, email: account.email, role: "owner", invitedAt: now, status: "active" });
  }

  d.notifications.push({
    id: uid("n"),
    userId: user.id,
    title: "Welcome to MarketIn",
    body: "Complete your profile and request verification to build trust with partners.",
    href: "/profile",
    read: false,
    createdAt: now,
  });
  commit();
  await createSession(user.id);
  return { ok: true };
}

export async function login(input: unknown, next?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  const user = await getUserByEmail(parsed.data.email);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return { ok: false, error: "Incorrect email or password." };
  }
  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended. Contact support@marketin.id for help." };
  }
  user.lastActiveAt = new Date().toISOString();
  commit();
  await createSession(user.id);
  redirect(safeNext(next) ?? (user.role === "admin" ? "/admin" : "/dashboard"));
}

const DEMO_ACCOUNTS: Record<Segment | "admin", string> = {
  business: "u_biz1",
  sales: "u_sales1",
  creator: "u_cr1",
  agency: "u_ag1",
  admin: "u_admin",
};

/** One-click demo sign-in. Only available with the mock data provider. */
export async function demoLogin(role: Segment | "admin") {
  if ((process.env.DATA_PROVIDER ?? "mock") !== "mock") throw new Error("Demo login is disabled");
  const id = DEMO_ACCOUNTS[role];
  if (!db().users.some((u) => u.id === id)) throw new Error("Demo account not found. Reset demo data.");
  await createSession(id);
  redirect(role === "admin" ? "/admin" : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  // With Supabase this calls supabase.auth.resetPasswordForEmail(). The mock provider
  // has no mail transport, so we intentionally return the same message regardless of
  // whether the account exists (avoids account enumeration).
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  return { ok: true, message: "If an account exists for this email, a reset link will be sent." };
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  if (!verifyPassword(parsed.data.current, user.passwordHash)) {
    return { ok: false, error: "Current password is incorrect.", fieldErrors: { current: "Incorrect password" } };
  }
  user.passwordHash = hashPassword(parsed.data.next);
  commit();
  return { ok: true, message: "Password updated." };
}
