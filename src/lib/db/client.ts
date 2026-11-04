import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Postgres access for the whole app.
 *
 * - DATABASE_URL set → Supabase Postgres (or any Postgres) through postgres.js.
 *   Use Supabase's transaction pooler URL (port 6543) on serverless hosts.
 * - DATABASE_URL missing → embedded PGlite (Postgres compiled to WASM), created
 *   from supabase/migrations + seed data. Persisted to .data/pglite locally and
 *   kept in memory on Vercel. This keeps the zero-config demo working.
 */

export type Row = Record<string, unknown>;

export interface Queryable {
  query<T = Row>(text: string, params?: unknown[]): Promise<T[]>;
}

export interface Db extends Queryable {
  kind: "postgres" | "embedded";
  tx<T>(fn: (q: Queryable) => Promise<T>): Promise<T>;
  /** Run a multi-statement SQL script (no parameters). */
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

const g = globalThis as unknown as { __marketinDbPromise?: Promise<Db> };

export function isEmbedded() {
  return !process.env.DATABASE_URL;
}

export function getDb(): Promise<Db> {
  if (!g.__marketinDbPromise) {
    g.__marketinDbPromise = (isEmbedded() ? createEmbeddedDb() : createPostgresDb(process.env.DATABASE_URL!)).catch((err) => {
      g.__marketinDbPromise = undefined; // allow a retry on the next request
      throw err;
    });
  }
  return g.__marketinDbPromise;
}

/* ------------------------------- Postgres --------------------------------- */

export async function createPostgresDb(url: string): Promise<Db> {
  const { default: postgres } = await import("postgres");
  const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
  const sql = postgres(url, {
    prepare: false, // required by Supabase's transaction pooler
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    idle_timeout: 20,
    ssl: local ? false : "require",
  });
  const wrap = (s: typeof sql): Queryable => ({
    query: async <T,>(text: string, params: unknown[] = []) =>
      (await s.unsafe(text, params as never[])) as unknown as T[],
  });
  return {
    kind: "postgres",
    ...wrap(sql),
    tx: <T,>(fn: (q: Queryable) => Promise<T>) => sql.begin((t) => fn(wrap(t as unknown as typeof sql))) as Promise<T>,
    exec: async (script: string) => {
      await sql.unsafe(script);
    },
    close: () => sql.end(),
  };
}

/* ------------------------------- Embedded --------------------------------- */

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");
const SEED_FILE = path.join(process.cwd(), "supabase", "seed.sql");

// Stand-ins for objects Supabase provides, so the migrations run unchanged.
const SUPABASE_SHIM = `
  create schema if not exists auth;
  create table if not exists auth.users (id uuid primary key);
  create or replace function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated; end if;
  end $$;
`;

export async function createEmbeddedDb(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const persist = !process.env.VERCEL && process.env.MOCK_DB_PERSIST !== "false";
  const dataDir = persist ? path.join(process.cwd(), ".data", "pglite") : undefined;
  if (dataDir) fs.mkdirSync(dataDir, { recursive: true });
  const pg = dataDir ? new PGlite(dataDir) : new PGlite();

  const wrap = (p: { query: typeof pg.query }): Queryable => ({
    query: async <T,>(text: string, params: unknown[] = []) => (await p.query<T>(text, params)).rows,
  });
  const db: Db = {
    kind: "embedded",
    ...wrap(pg),
    tx: <T,>(fn: (q: Queryable) => Promise<T>) => pg.transaction((t) => fn(wrap(t))),
    exec: async (script: string) => {
      await pg.exec(script);
    },
    close: () => pg.close(),
  };

  const [{ ready }] = await db.query<{ ready: boolean }>(
    "select to_regclass('public.user_credentials') is not null as ready",
  );
  if (!ready) await bootstrapEmbedded(db);
  return db;
}

/** Create the schema from the real migrations, then load plans, taxonomies and demo data. */
export async function bootstrapEmbedded(db: Db) {
  await db.exec(SUPABASE_SHIM);
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    // pgcrypto isn't bundled with PGlite; gen_random_uuid() is built in since Postgres 13.
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), "utf8").replace(/create extension[^;]*pgcrypto[^;]*;/gi, "");
    await db.exec(sql);
  }
  await db.exec(fs.readFileSync(SEED_FILE, "utf8"));
  const { loadDemoData } = await import("./demo-data");
  await loadDemoData(db);
}

/** Wipe and rebuild the embedded database (admin "Reset demo data"). */
export async function resetEmbedded() {
  if (!isEmbedded()) throw new Error("Reset is only available for the embedded demo database.");
  const db = await getDb();
  await db.exec("drop schema public cascade; create schema public; drop schema if exists auth cascade;");
  await bootstrapEmbedded(db);
}
