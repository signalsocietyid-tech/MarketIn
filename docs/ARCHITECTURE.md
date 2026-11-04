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
| Mock data provider by default | The MVP runs with zero credentials. All reads go through async functions in `src/lib/data/queries.ts` (plus `*-queries.ts` and `insights.ts`) and all writes through server actions, so a Supabase adapter can replace the store without touching pages. |
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
                                    └─ lib/data/queries.ts ──► store (mock) | Supabase (future)
Client component ──► Server Action (lib/actions/*) ──► validate (Zod) ──► authorize ──► mutate ──► revalidatePath
```

## Switching to Supabase

1. Create a Supabase project and run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
2. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `DATA_PROVIDER=supabase`.
3. Auth: replace `createSession` / `getCurrentUser` in `src/lib/auth/session.ts` with `createSupabaseServerClient().auth` (`signUp`, `signInWithPassword`, `getUser`, `signOut`, `resetPasswordForEmail`), and insert the `public.users` row plus the role profile on sign-up. Update `src/proxy.ts` to refresh the Supabase session cookie (see the `@supabase/ssr` Next.js guide).
4. Data: implement each function in `src/lib/data/queries.ts` (and `admin-queries.ts`, `dashboard-queries.ts`, `marketplace-queries.ts`, `insights.ts`) against Supabase, keeping the same return types. Column names are the snake_case equivalents of the TypeScript fields.
5. Actions: replace the `db()` mutations in `src/lib/actions/*` with Supabase calls. Keep the existing permission checks; RLS is a second line of defense, not a replacement.
6. Subscriptions: write `user_subscriptions` and `subscription_events` only with the service-role client (webhook / admin).

## Mock store details

- `src/lib/data/store.ts` keeps a singleton on `globalThis` (it survives hot reload) and writes it through to `.data/marketin-db.json` after mutations (debounced). Set `MOCK_DB_PERSIST=false` where the filesystem is read-only.
- Bump `SCHEMA_VERSION` in `store.ts` when the seed shape changes, so stale JSON files are ignored.
- The mock store is single-process and not safe for multi-instance production use.
