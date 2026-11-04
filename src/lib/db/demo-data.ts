import "server-only";
import { createHash } from "node:crypto";
import type { Database } from "@/lib/types";
import { buildSeed, DEMO_PASSWORD } from "@/lib/data/seed";
import { hashPassword } from "@/lib/auth/password";
import type { Db } from "./client";
import { insertRow, type Collection } from "./tables";

// Seed ids are readable keys like "u_biz1"; the schema uses UUIDs.
const SEED_ID = /^(u|op|ap|pa|rv|n|rp|t|tm|sub|se|cat)_[A-Za-z0-9_]+$/;
const SEED_ID_IN_TEXT = /\b(u|op|ap|pa)_[A-Za-z0-9]+\b/g;

/** Stable UUID for a seed key, so links and demo logins survive a reset. */
export function seedUuid(key: string) {
  const h = createHash("sha256").update(`marketin-demo:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function mapIds<T>(value: T, field?: string): T {
  if (typeof value === "string") {
    if (SEED_ID.test(value)) return seedUuid(value) as T;
    if (field === "href") return value.replace(SEED_ID_IN_TEXT, (m) => seedUuid(m)) as T;
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => mapIds(v)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapIds(v, k)])) as T;
  }
  return value;
}

// Parents before children (foreign keys). Plans and categories come from supabase/seed.sql.
const ORDER: Collection[] = [
  "users",
  "businesses",
  "salesPartners",
  "creators",
  "agencies",
  "talents",
  "teamMembers",
  "opportunities",
  "applications",
  "partnerships",
  "reviews",
  "subscriptions",
  "subscriptionEvents",
  "notifications",
  "reports",
  "saved",
];

/** Insert the fictional demo marketplace (see src/lib/data/seed.ts). */
export async function loadDemoData(db: Db, opts: { includeAdmin?: boolean } = {}) {
  const seed = mapIds(buildSeed()) as Database;
  const includeAdmin = opts.includeAdmin ?? true;
  const users = seed.users.filter((u) => includeAdmin || u.role !== "admin");
  const userIds = new Set(users.map((u) => u.id));
  const hash = hashPassword(DEMO_PASSWORD);

  await db.tx(async (q) => {
    for (const c of ORDER) {
      let rows = (c === "users" ? users : seed[c]) as Database[typeof c];
      if (c === "notifications") rows = (rows as Database["notifications"]).filter((n) => userIds.has(n.userId)) as typeof rows;
      for (const row of rows) await insertRow(q, c, row as never);
      if (c === "users") {
        for (const u of users) {
          await q.query("insert into public.user_credentials (user_id, password_hash) values ($1, $2)", [u.id, hash]);
        }
      }
    }
  });
}
