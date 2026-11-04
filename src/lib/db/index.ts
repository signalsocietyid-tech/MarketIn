import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import type { Database } from "@/lib/types";
import { getDb, type Queryable } from "./client";
import { deleteRows, insertRow, loadCollections, SPECS, updateRow, type Collection } from "./tables";

export { getDb, isEmbedded } from "./client";
export type { Queryable } from "./client";

const ALL = Object.keys(SPECS) as Collection[];

// One snapshot per request, shared by every query helper rendered in it.
// Outside a React request scope `cache` doesn't memoize, so reads stay fresh.
const requestBox = cache(() => ({ current: null as Promise<Database> | null }));

/**
 * Current marketplace data, loaded from Postgres. Read-only: change data with
 * `write()` so the snapshot is refreshed afterwards.
 */
export function data(): Promise<Database> {
  const box = requestBox();
  if (!box.current) {
    // Wait for a real request: database reads never run during build-time prerendering.
    box.current = connection()
      .then(() => getDb())
      .then((db) => loadCollections(db, ALL))
      .catch((err) => {
        box.current = null;
        throw err;
      });
  }
  return box.current;
}

/** Drop the request snapshot so later reads see the latest writes. */
export function invalidate() {
  requestBox().current = null;
}

export type Tx = {
  q: Queryable;
  insert<C extends Collection>(collection: C, obj: Database[C][number]): Promise<void>;
  update<C extends Collection>(collection: C, key: string | Record<string, string>, patch: Partial<Database[C][number]>): Promise<void>;
  remove<C extends Collection>(collection: C, where: Record<string, string>): Promise<void>;
};

/** Run writes in one transaction, then invalidate the request snapshot. */
export async function write<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const db = await getDb();
  const result = await db.tx((q) =>
    fn({
      q,
      insert: (c, obj) => insertRow(q, c, obj),
      update: (c, key, patch) => updateRow(q, c, key, patch),
      remove: (c, where) => deleteRows(q, c, where),
    }),
  );
  invalidate();
  return result;
}

/* ------------------------------ credentials -------------------------------- */

export async function getPasswordHash(userId: string) {
  const db = await getDb();
  const [row] = await db.query<{ password_hash: string }>("select password_hash from public.user_credentials where user_id = $1", [userId]);
  return row?.password_hash ?? null;
}

export async function setPasswordHash(q: Queryable, userId: string, hash: string) {
  await q.query(
    `insert into public.user_credentials (user_id, password_hash) values ($1, $2)
     on conflict (user_id) do update set password_hash = excluded.password_hash, updated_at = now()`,
    [userId, hash],
  );
}
