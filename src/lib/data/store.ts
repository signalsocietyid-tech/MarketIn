import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Database } from "@/lib/types";
import { buildSeed, DEMO_PASSWORD } from "./seed";
import { hashPassword } from "@/lib/auth/password";

/**
 * Mock data store used when DATA_PROVIDER is "mock" (the default).
 *
 * Data lives in memory and is written through to .data/marketin-db.json in
 * development so registrations survive a dev-server restart. Set
 * MOCK_DB_PERSIST=false to keep it purely in memory (automatic on Vercel).
 * The Supabase schema in supabase/migrations mirrors these collections 1:1.
 */

const DATA_FILE = path.join(process.cwd(), ".data", "marketin-db.json");
const SCHEMA_VERSION = 1;
// Vercel and similar hosts have a read-only filesystem, so persistence is off there.
const persist = process.env.MOCK_DB_PERSIST !== "false" && !process.env.VERCEL;

type Stored = { version: number; db: Database };

const globalStore = globalThis as unknown as { __marketinDb?: Database; __marketinWrite?: NodeJS.Timeout };

function loadFromDisk(): Database | null {
  if (!persist) return null;
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Stored;
    return parsed.version === SCHEMA_VERSION ? parsed.db : null;
  } catch {
    return null;
  }
}

function freshSeed(): Database {
  return buildSeed(hashPassword(DEMO_PASSWORD));
}

export function db(): Database {
  if (!globalStore.__marketinDb) {
    globalStore.__marketinDb = loadFromDisk() ?? freshSeed();
  }
  return globalStore.__marketinDb;
}

/** Schedule a write-through to disk after a mutation. */
export function commit() {
  if (!persist) return;
  clearTimeout(globalStore.__marketinWrite);
  globalStore.__marketinWrite = setTimeout(() => {
    try {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      const payload: Stored = { version: SCHEMA_VERSION, db: db() };
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload));
    } catch (err) {
      console.warn("[marketin] Could not persist mock database:", (err as Error).message);
    }
  }, 150);
}

/** Restore the original seed data (admin action, mock mode only). */
export function resetStore() {
  globalStore.__marketinDb = freshSeed();
  commit();
}
