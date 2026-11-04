import "server-only";
import type { Segment } from "@/lib/types";
import { isEmbedded } from "@/lib/db";

export type DemoRole = Segment | "admin";

/** Seeded demo accounts (src/lib/data/seed.ts), looked up by email. */
export const DEMO_EMAILS: Record<DemoRole, string> = {
  business: "business@marketin.demo",
  sales: "sales@marketin.demo",
  creator: "creator@marketin.demo",
  agency: "agency@marketin.demo",
  admin: "admin@marketin.demo",
};

/**
 * Which one-click demo logins are allowed. On the embedded demo database all of
 * them are. On a real database (Supabase) they are off unless
 * ENABLE_DEMO_LOGIN=true, and the admin demo is never offered there.
 */
export function demoRoles(): DemoRole[] {
  if (isEmbedded()) return ["business", "sales", "creator", "agency", "admin"];
  if (process.env.ENABLE_DEMO_LOGIN === "true") return ["business", "sales", "creator", "agency"];
  return [];
}
