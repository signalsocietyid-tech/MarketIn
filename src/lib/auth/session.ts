import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Role, User } from "@/lib/types";
import { db } from "@/lib/data/store";

export const SESSION_COOKIE = "marketin_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    console.warn("[marketin] SESSION_SECRET is missing or shorter than 32 characters. Using an insecure fallback.");
  }
  return "marketin-dev-only-insecure-session-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function encode(payload: { uid: string; exp: number }) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): { uid: string; exp: number } | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as { uid: string; exp: number };
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, encode({ uid: userId, exp: Date.now() + MAX_AGE * 1000 }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** The signed-in user, or null. Suspended accounts are treated as signed out. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const payload = decode((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = db().users.find((u) => u.id === payload.uid);
  if (!user || user.status === "suspended") return null;
  return user;
});

export async function requireUser(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  return user;
}

export async function requireRole(roles: Role[], next?: string): Promise<User> {
  const user = await requireUser(next);
  if (!roles.includes(user.role)) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  return user;
}

/** A narrow, client-safe view of the user. Never pass the full User to client components. */
export type SessionUser = Pick<User, "id" | "name" | "email" | "role" | "verification">;
export function toSessionUser(u: User): SessionUser {
  return { id: u.id, name: u.name, email: u.email, role: u.role, verification: u.verification };
}
