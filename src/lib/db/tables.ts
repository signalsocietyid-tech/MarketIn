import "server-only";
import type { Database, Partnership, SocialAccount, SubscriptionPlan } from "@/lib/types";
import type { Queryable, Row } from "./client";

/**
 * Mapping between the TypeScript domain model (src/lib/types.ts, camelCase)
 * and the Postgres schema (supabase/migrations, snake_case).
 */

export type Collection = Exclude<keyof Database, never>;

type Spec = {
  table: string;
  /** Primary key fields (camelCase). */
  key: string[];
  /** text[] columns (camelCase field names). */
  arrays?: string[];
  /** jsonb columns. */
  json?: string[];
  /** numeric / bigint columns that drivers may return as strings. */
  numbers?: string[];
  /** Fields that live elsewhere and must not be written to this table. */
  virtual?: string[];
  order?: string;
};

export const SPECS: Record<Collection, Spec> = {
  users: { table: "users", key: ["id"], virtual: ["passwordHash"], order: "created_at" },
  businesses: { table: "businesses", key: ["userId"] },
  salesPartners: { table: "sales_partners", key: ["userId"], arrays: ["industries", "partnershipTypes", "areas", "specializations"] },
  creators: { table: "creators", key: ["userId"], arrays: ["creatorTypes", "niches", "collaborationTypes"], numbers: ["engagementRate"], virtual: ["socials"] },
  agencies: { table: "agencies", key: ["userId"], arrays: ["services"] },
  talents: { table: "talents", key: ["id"], order: "added_at" },
  teamMembers: { table: "team_members", key: ["id"], order: "invited_at" },
  opportunities: {
    table: "opportunities",
    key: ["id"],
    arrays: ["requirements", "deliverables", "platforms"],
    numbers: ["budgetMin", "budgetMax"],
    order: "created_at",
  },
  applications: { table: "applications", key: ["id"], order: "created_at" },
  partnerships: { table: "partnerships", key: ["id"], virtual: ["metrics"], order: "start_date" },
  plans: { table: "subscription_plans", key: ["id"], arrays: ["benefits", "entitlements"], json: ["limits"], numbers: ["priceMonthly", "priceYearly"], order: "sort_order" },
  subscriptions: { table: "user_subscriptions", key: ["id"], order: "created_at" },
  subscriptionEvents: { table: "subscription_events", key: ["id"], numbers: ["amount"], order: "created_at" },
  reviews: { table: "reviews", key: ["id"], order: "created_at" },
  notifications: { table: "notifications", key: ["id"], order: "created_at" },
  reports: { table: "reports", key: ["id"], order: "created_at" },
  categories: { table: "categories", key: ["id"] },
  saved: { table: "saved_items", key: ["userId", "targetType", "targetId"], order: "created_at" },
};

const METRIC_COLUMNS: Record<keyof Partnership["metrics"], string> = {
  leads: "leads",
  conversions: "conversions",
  revenue: "revenue",
  contentPieces: "content_pieces",
  reach: "reach",
};

export const snake = (s: string) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/* --------------------------------- reading --------------------------------- */

function fromRow<C extends Collection>(collection: C, row: Row): Database[C][number] {
  const spec = SPECS[collection];
  const out: Row = {};
  for (const [col, raw] of Object.entries(row)) {
    if (raw === null || raw === undefined) continue; // optional fields are undefined in the model
    const field = camel(col);
    let v: unknown = raw;
    if (v instanceof Date) v = v.toISOString();
    else if (typeof v === "bigint") v = Number(v);
    else if (spec.numbers?.includes(field) && typeof v === "string") v = Number(v);
    else if (spec.json?.includes(field) && typeof v === "string") v = JSON.parse(v);
    out[field] = v;
  }
  if (collection === "partnerships") {
    const metrics = {} as Partnership["metrics"];
    for (const [k, col] of Object.entries(METRIC_COLUMNS) as [keyof Partnership["metrics"], string][]) {
      metrics[k] = Number(row[col] ?? 0);
      delete out[camel(col)];
    }
    out.metrics = metrics;
  }
  if (collection === "plans") {
    const limits = out.limits as Record<string, unknown>;
    out.limits = Object.fromEntries(Object.entries(limits ?? {}).map(([k, v]) => [k, Number(v)]));
  }
  return out as unknown as Database[C][number];
}

/** Load whole collections (MVP-scale data; see docs/ARCHITECTURE.md). */
export async function loadCollections<C extends Collection>(q: Queryable, collections: readonly C[]): Promise<Pick<Database, C>> {
  const out = {} as Pick<Database, C>;
  await Promise.all(
    collections.map(async (c) => {
      const spec = SPECS[c];
      const rows = await q.query(`select * from public.${spec.table}${spec.order ? ` order by ${spec.order}` : ""}`);
      (out as Record<string, unknown>)[c] = rows.map((r) => fromRow(c, r));
    }),
  );
  if ("creators" in out) {
    const socials = await q.query<{ creator_id: string; platform: string; handle: string; url: string; followers: number | string }>(
      "select creator_id, platform, handle, url, followers from public.creator_socials order by creator_id, platform",
    );
    for (const c of (out as Pick<Database, "creators">).creators) {
      c.socials = socials
        .filter((s) => s.creator_id === c.userId)
        .map((s) => ({ platform: s.platform as SocialAccount["platform"], handle: s.handle, url: s.url, followers: Number(s.followers) }));
    }
  }
  return out;
}

/* --------------------------------- writing --------------------------------- */

function columnsFor(collection: Collection, obj: Record<string, unknown>, includeUndefined: boolean) {
  const spec = SPECS[collection];
  const cols: { col: string; value: unknown; cast: string }[] = [];
  for (const [field, value] of Object.entries(obj)) {
    if (spec.virtual?.includes(field)) continue;
    if (value === undefined && !includeUndefined) continue;
    const col = snake(field);
    if (spec.json?.includes(field)) cols.push({ col, value: value == null ? null : JSON.stringify(value), cast: "::text::jsonb" });
    else if (spec.arrays?.includes(field)) cols.push({ col, value: value ?? [], cast: "::text[]" });
    else cols.push({ col, value: value ?? null, cast: "" });
  }
  if (collection === "partnerships" && obj.metrics) {
    for (const [k, col] of Object.entries(METRIC_COLUMNS)) {
      cols.push({ col, value: (obj.metrics as Record<string, number>)[k] ?? 0, cast: "" });
    }
  }
  return cols;
}

export async function insertRow<C extends Collection>(q: Queryable, collection: C, obj: Database[C][number]) {
  const cols = columnsFor(collection, obj as unknown as Record<string, unknown>, false);
  const sql = `insert into public.${SPECS[collection].table} (${cols.map((c) => c.col).join(", ")}) values (${cols
    .map((c, i) => `$${i + 1}${c.cast}`)
    .join(", ")})`;
  await q.query(sql, cols.map((c) => c.value));
  if (collection === "creators") await replaceSocials(q, (obj as Database["creators"][number]).userId, (obj as Database["creators"][number]).socials);
}

/** Update fields of one row by primary key. An explicit `undefined` clears the column. */
export async function updateRow<C extends Collection>(
  q: Queryable,
  collection: C,
  key: string | Record<string, string>,
  patch: Partial<Database[C][number]>,
) {
  const spec = SPECS[collection];
  const keyObj = typeof key === "string" ? { [spec.key[0]]: key } : key;
  const cols = columnsFor(collection, patch as Record<string, unknown>, true);
  if (cols.length) {
    const where = Object.keys(keyObj).map((k, i) => `${snake(k)} = $${cols.length + i + 1}`).join(" and ");
    await q.query(
      `update public.${spec.table} set ${cols.map((c, i) => `${c.col} = $${i + 1}${c.cast}`).join(", ")} where ${where}`,
      [...cols.map((c) => c.value), ...Object.values(keyObj)],
    );
  }
  if (collection === "creators" && "socials" in (patch as object)) {
    await replaceSocials(q, Object.values(keyObj)[0], (patch as Partial<Database["creators"][number]>).socials ?? []);
  }
}

export async function deleteRows<C extends Collection>(q: Queryable, collection: C, where: Record<string, string>) {
  const keys = Object.keys(where);
  if (!keys.length) throw new Error("deleteRows requires a condition");
  await q.query(
    `delete from public.${SPECS[collection].table} where ${keys.map((k, i) => `${snake(k)} = $${i + 1}`).join(" and ")}`,
    Object.values(where),
  );
}

async function replaceSocials(q: Queryable, creatorId: string, socials: SocialAccount[]) {
  await q.query("delete from public.creator_socials where creator_id = $1", [creatorId]);
  for (const s of socials) {
    await q.query(
      "insert into public.creator_socials (creator_id, platform, handle, url, followers) values ($1, $2, $3, $4, $5)",
      [creatorId, s.platform, s.handle, s.url, s.followers],
    );
  }
}

export type { SubscriptionPlan };
