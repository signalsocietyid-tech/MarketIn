"use server";

import { redirect } from "next/navigation";
import type { User } from "@/lib/types";
import { getPasswordHash, setPasswordHash, write } from "@/lib/db";
import { getUserByEmail } from "@/lib/data/queries";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, requireUser } from "@/lib/auth/session";
import { DEMO_EMAILS, demoRoles, type DemoRole } from "@/lib/demo";
import {
  type ActionResult,
  loginSchema,
  passwordChangeSchema,
  registerSchema,
  zodFieldErrors,
} from "@/lib/validation";
import { newId } from "@/lib/utils";

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

  const now = new Date().toISOString();
  const name = role === "business" ? profile.companyName : role === "agency" ? profile.agencyName : profile.fullName;
  const user: User = {
    id: newId(),
    email: account.email,
    role,
    name,
    status: "active",
    verification: "unverified",
    createdAt: now,
    lastActiveAt: now,
  };

  await write(async (tx) => {
    await tx.insert("users", user);
    await setPasswordHash(tx.q, user.id, hashPassword(account.password));
    if (role === "business") await tx.insert("businesses", { userId: user.id, ...profile, website: profile.website || undefined, logoUrl: profile.logoUrl || undefined });
    if (role === "sales") await tx.insert("salesPartners", { userId: user.id, ...profile });
    if (role === "creator") await tx.insert("creators", { userId: user.id, ...profile });
    if (role === "agency") {
      await tx.insert("agencies", { userId: user.id, ...profile, website: profile.website || undefined });
      await tx.insert("teamMembers", { id: newId(), agencyId: user.id, name: profile.agencyName, email: account.email, role: "owner", invitedAt: now, status: "active" });
    }
    await tx.insert("notifications", {
      id: newId(),
      userId: user.id,
      title: "Welcome to MarketIn",
      body: "Complete your profile and request verification to build trust with partners.",
      href: "/profile",
      read: false,
      createdAt: now,
    });
  });
  await createSession(user.id);
  return { ok: true };
}

export async function login(input: unknown, next?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  const user = await getUserByEmail(parsed.data.email);
  const hash = user ? await getPasswordHash(user.id) : null;
  if (!user || !hash || !verifyPassword(parsed.data.password, hash)) {
    return { ok: false, error: "Incorrect email or password." };
  }
  if (user.status === "suspended") {
    return { ok: false, error: "This account is suspended. Contact support@marketin.id for help." };
  }
  await write((tx) => tx.update("users", user.id, { lastActiveAt: new Date().toISOString() }));
  await createSession(user.id);
  redirect(safeNext(next) ?? (user.role === "admin" ? "/admin" : "/dashboard"));
}

/** One-click sign-in to a seeded demo account (see src/lib/demo.ts for when it's allowed). */
export async function demoLogin(role: DemoRole) {
  if (!demoRoles().includes(role)) throw new Error("Demo login is disabled");
  const user = await getUserByEmail(DEMO_EMAILS[role]);
  if (!user) throw new Error("Demo account not found. Load the demo data first.");
  await createSession(user.id);
  redirect(role === "admin" ? "/admin" : "/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(email: string): Promise<ActionResult> {
  // No mail transport is configured yet (planned with Supabase Auth). The same
  // message is returned whether or not the account exists, to avoid account enumeration.
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Enter a valid email address." };
  return { ok: true, message: "If an account exists for this email, a reset link will be sent." };
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = passwordChangeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) };
  const hash = await getPasswordHash(user.id);
  if (!hash || !verifyPassword(parsed.data.current, hash)) {
    return { ok: false, error: "Current password is incorrect.", fieldErrors: { current: "Incorrect password" } };
  }
  await write((tx) => setPasswordHash(tx.q, user.id, hashPassword(parsed.data.next)));
  return { ok: true, message: "Password updated." };
}
