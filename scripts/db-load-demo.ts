/**
 * Load the fictional demo marketplace (companies, partners, opportunities…)
 * into the database in DATABASE_URL, e.g. your Supabase project.
 *
 *   DATABASE_URL="postgresql://..." npm run db:demo
 *
 * - Requires the migrations in supabase/migrations plus supabase/seed.sql to be applied.
 * - The demo ADMIN account is never created here: its password is public in
 *   this repository. Promote a real account instead (see README → Admin access).
 * - Demo accounts share the public demo password, so only load this into a
 *   database used for demos, and remove it before real users join.
 */
import { createPostgresDb } from "../src/lib/db/client";
import { loadDemoData } from "../src/lib/db/demo-data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL to the target database first.");
  const db = await createPostgresDb(url);
  const [{ n }] = await db.query<{ n: number }>("select count(*)::int as n from public.users where email like '%@marketin.demo'");
  if (n > 0) {
    console.log(`Demo data already present (${n} demo accounts). Nothing to do.`);
    await db.close();
    process.exit(0);
  }
  const [{ plans }] = await db.query<{ plans: number }>("select count(*)::int as plans from public.subscription_plans");
  if (plans === 0) throw new Error("No subscription plans found. Run supabase/seed.sql first.");
  await loadDemoData(db, { includeAdmin: false });
  await db.close();
  console.log("Demo marketplace loaded (without the admin account).");
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
