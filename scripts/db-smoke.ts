/**
 * Database smoke test: builds the schema from supabase/migrations, loads the
 * demo data and reads every collection back — once through embedded PGlite and
 * once through postgres.js (the production driver) talking to PGlite over TCP.
 *
 *   npm run test:db
 */
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { bootstrapEmbedded, createEmbeddedDb, createPostgresDb, type Db } from "../src/lib/db/client";
import { loadCollections, SPECS, type Collection } from "../src/lib/db/tables";

process.env.MOCK_DB_PERSIST = "false";
const ALL = Object.keys(SPECS) as Collection[];

async function counts(db: Db) {
  const d = await loadCollections(db, ALL);
  return Object.fromEntries(ALL.map((c) => [c, d[c].length])) as Record<Collection, number>;
}

async function roundTrip(db: Db, label: string) {
  const d = await loadCollections(db, ["opportunities", "plans", "creators", "partnerships"]);
  const o = d.opportunities.find((x) => x.requirements.length > 1)!;
  const plan = d.plans.find((p) => p.id === "plan_agency_pro")!;
  const creator = d.creators.find((c) => c.socials.length > 1)!;
  const p = d.partnerships.find((x) => x.metrics.revenue > 0)!;
  const checks: [string, boolean][] = [
    ["text[] arrays", Array.isArray(o.requirements) && typeof o.requirements[0] === "string"],
    ["timestamps as ISO strings", typeof o.createdAt === "string" && !Number.isNaN(Date.parse(o.createdAt))],
    ["jsonb limits", plan.limits.talentRoster === 50],
    ["bigint prices as numbers", plan.priceMonthly === 499000],
    ["creator socials", creator.socials.every((s) => typeof s.followers === "number")],
    ["numeric engagement", typeof creator.engagementRate === "number"],
    ["partnership metrics", typeof p.metrics.revenue === "number" && p.metrics.revenue > 0],
  ];
  for (const [name, ok] of checks) console.log(`  ${ok ? "ok  " : "FAIL"} ${label}: ${name}`);
  return checks.every(([, ok]) => ok);
}

async function main() {
  console.log("Embedded (PGlite):");
  const embedded = await createEmbeddedDb();
  const a = await counts(embedded);
  console.log("  rows:", JSON.stringify(a));
  const okA = await roundTrip(embedded, "embedded");

  console.log("postgres.js over TCP:");
  const pg = await PGlite.create();
  const server = new PGLiteSocketServer({ db: pg, port: 0, host: "127.0.0.1" });
  await server.start();
  const port = (server as unknown as { server: { address(): { port: number } } }).server.address().port;
  process.env.DATABASE_POOL_MAX = "1";
  const remote = await createPostgresDb(`postgres://postgres@127.0.0.1:${port}/postgres`);
  await bootstrapEmbedded(remote);
  const b = await counts(remote);
  const okB = await roundTrip(remote, "postgres.js");
  const same = ALL.every((c) => a[c] === b[c]);
  console.log(`  rows match embedded: ${same ? "ok" : "FAIL"}`);
  await remote.close();
  await server.stop();
  await pg.close();
  await embedded.close();

  if (!okA || !okB || !same) process.exit(1);
  console.log("All database checks passed.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
