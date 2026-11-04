# Architecture notes

## Stack

- **Next.js 16.4** (App Router, React 19, Server Components + Server Actions), TypeScript (strict).
- **Tailwind CSS v4**: design tokens live in `src/app/globals.css` (`@theme`). Orange `brand-*` is the primary accent; `navy-*` and `blue-*` give structure. Body text uses `ink` / `subtle`; `muted` (#8A94A6) is reserved for icons and meta text because it doesn't meet AA contrast for body copy. Orange text on white uses `brand-700` for the same reason.
- **UI primitives**: shadcn-style components written on top of Radix (`radix-ui` package) in `src/components/ui/`. They are owned code, not generated, so they can be edited freely.
- **Lucide** icons. Brand marks (Instagram, TikTok…) were removed from Lucide, so simple glyphs live in `src/components/brand/social-icons.tsx`.
- **React Hook Form + Zod** (v4). Schemas in `src/lib/validation.ts` are used by client forms and re-validated in every server action.
- **Recharts** for dashboard charts (client components only).

## Decisions

| Decision | Reason |
| --- | --- |
| `cacheComponents` turned **off** (template default was on) | Almost every route reads the session cookie and renders per-user data. The classic dynamic model avoids wrapping every session read in `<Suspense>` and `use cache: private`. It can be revisited for the marketing pages. |
| One Postgres code path | Production uses Supabase Postgres through `DATABASE_URL` (postgres.js, transaction pooler). Without it, the same SQL runs on embedded PGlite built from `supabase/migrations`, so the zero-config demo and the tests exercise the real schema. |
| Server-only database access | All queries run on the server with app-level authorization. The `app_auth_and_server_access` migration revokes the public API roles (`anon`, `authenticated`); the RLS policies stay as defense in depth for when client-side Supabase access is added. |
| App-managed credentials (for now) | Passwords are scrypt hashes in `user_credentials` with a signed session cookie. Supabase Auth is the planned next step for confirmation and reset emails. |
| Plans drive permissions | `src/lib/permissions.ts` resolves the user's effective plan (an active paid subscription, otherwise the segment's free plan) and checks `entitlements` and `limits` from plan data. Admins edit those in `/admin/plans`. Role capabilities (who may publish or apply) are separate from plan features. |
| Optimistic proxy + server checks | `src/proxy.ts` only checks for the session cookie and redirects. Real authorization (signature, role, suspended status) is enforced in layouts (`requireUser`, `requireRole`) and again inside every server action. |
| No simulated payments | `startCheckout` creates a `pending_payment` subscription through `getPaymentProvider()`. Only an admin's manual activation or (in future) a verified gateway webhook can make it `active`. |
| Premium terms masked server-side | Locked listings never send compensation details to the browser for non-entitled viewers. |
| Agency is its own account type | Agencies have a roster (`talents`), team seats (`team_members`), an opportunity inbox, and can apply on behalf of a talent. |

## Request flow

```
Browser ──► proxy.ts (cookie present?) ──► layout (requireUser / requireRole)
                                             │
                                             ▼
                                    Server Component page
                                    └─ lib/data/queries.ts ──► lib/db data() ──► Postgres (Supabase | PGlite)
Client component ──► Server Action (lib/actions/*) ──► validate (Zod) ──► authorize ──► lib/db write() (transaction) ──► revalidatePath
```

## Database access (`src/lib/db`)

- `client.ts` opens the connection: postgres.js for `DATABASE_URL` (with `prepare: false` for Supabase's pooler and SSL), otherwise PGlite. PGlite is persisted to `.data/pglite` locally and kept in memory on Vercel. On first use it runs every file in `supabase/migrations`, then `supabase/seed.sql` and the demo data.
- `tables.ts` maps each domain collection to its table: camelCase ↔ snake_case, `text[]`, `jsonb` (plan limits), numeric columns, social accounts in `creator_socials`, and partnership metrics flattened into columns.
- `index.ts` exposes `data()`, a snapshot of all collections loaded once per request (React `cache`) after `connection()`, so nothing runs at build time; and `write(fn)`, a transaction with `insert` / `update` / `remove` helpers that invalidates the snapshot.
- `demo-data.ts` turns `src/lib/data/seed.ts` into rows, mapping readable seed keys (`u_biz1`, `op_1`…) to stable UUIDs.
- Scale note: `data()` reads whole tables and the query helpers filter in code, which is simple and fine for an MVP. As data grows, move the heavy queries (marketplace search, admin lists) to targeted SQL with indexes and pagination.

### Schema changes

Add a new timestamped file to `supabase/migrations/` (never edit one that may already be applied), then run `npm run test:db`. It builds the schema and demo data on PGlite and on postgres.js, then checks the mappings round-trip. Pushing to `main` applies the migration to Supabase through the GitHub integration.

### Moving to Supabase Auth

1. Sign users up and in with Supabase Auth (`@supabase/ssr`: `signUp`, `signInWithPassword`, `resetPasswordForEmail`), using the auth user id as `public.users.id`.
2. Replace the cookie session in `src/lib/auth/session.ts` with `supabase.auth.getUser()` and refresh the session in `src/proxy.ts`.
3. New migration: restore `users.id references auth.users (id)` and drop `user_credentials` after existing users have reset their passwords.
